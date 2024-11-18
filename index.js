import express from "express";
import "dotenv/config";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5500",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = [];

app.use((req, res, next) => {
  const { username } = req.body;
  const user = users.find((u) => u.username === username);

  if (user && user.mustChangePassword) {
    return res
      .status(403)
      .json({ message: "Вы должны изменить пароль перед доступом к системе." });
  }
  next();
});

function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  console.log("Полученный токен:", token);
  console.log("Заголовки запроса:", req.headers);

  if (!token) {
    return res.status(401).json({ message: "Токен не предоставлен" });
  }

  jwt.verify(token, "your-secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Неверный или истекший токе" });
    }
    req.user = user;
    next();
  });
}

const port = process.env.PORT;
app.get("/", (req, res) => {
  res.send("Hello node");
});

app.post("/register", async (req, res) => {
  try {
    const { email, password, username, mustChangePassword, role } = req.body;
    const isUniqEmail = users.find((user) => user.email === email);

    if (isUniqEmail) {
      return res
        .status(404)
        .json({ message: "Пользователь с таким email уже существует" });
    }
    const userMustChangePassword =
      mustChangePassword !== undefined ? mustChangePassword : false;
    const heshedPassword = await bcrypt.hash(password, 5);
    const newUser = {
      email,
      password: heshedPassword,
      username,
      mustChangePassword: userMustChangePassword,
      role,
    };
    users.push(newUser);

    const token = jwt.sign(
      {
        username: newUser.username,
        role: newUser.role,
      },
      "your-secret-key",
      { expiresIn: `1h` }
    );

    res.status(200).json({
      message: `Пользователь с email ${email} был зарегестрирован`,
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Ошибка регистрации" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { password, username } = req.body;
    const user = users.find((user) => user.username === username);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "неправильный пароль" });
    }
    if (user.mustChangePassword) {
      return res.status(403).json({
        message: "Пароль должен быть изменен",
      });
    }
    const token = jwt.sign(
      {
        username: user.username,
        role: user.role,
      },
      "your-secret-key",
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Успешный вход в систему", token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Ошибка логирования" });
  }
});

app.post("/change-password", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find((user) => user.username === username);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const heshedPassword = await bcrypt.hash(password, 5);
    user.password = heshedPassword;
    user.mustChangePassword = false;
    res.status(200).json({ message: "Пароль успешно обновлен" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Ошибка изменения пароля" });
  }
});

app.post("/delete-account", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find((user) => user.username === username);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "неправильный пароль" });
    }

    const userIndex = users.indexOf(user);
    if (userIndex > -1) {
      users.splice(userIndex, 1);
    }

    res.status(200).json({ message: "Аккаунт успешно удален" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Ошибка удаления аккаунта" });
  }
});

app.get("/admin", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Доступ запрещен" });
  }
  res.status(200).json({ message: "Добро пожаловать" });
});

app.listen(port, () => {
  console.log(`Server running in http:/127.0.0.1:${port}`);
});
