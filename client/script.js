const register = document.querySelector(".register");
const login = document.querySelector(".login");
const profile = document.querySelector(".profile");
const update = document.querySelector(".update");
const change = document.querySelector(".change");
const deleteAcc = document.querySelector(".delete");
const admin = document.querySelector(".admin");

const url = "http://127.0.0.1:3333";
register.addEventListener("click", async () => {
  try {
    const response = await fetch(url + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "12343@gmail.com",
        password: "12345",
        username: "Yana",
        mustChangePassword: false,
        role: "admin",
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
});

login.addEventListener("click", async () => {
  try {
    const response = await fetch(url + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: "12345",
        username: "Yana",
      }),
    });
    const data = await response.json();
    if (response.ok) {
      const token = data.token;
      console.log("Токен:", token);
      localStorage.setItem("token", token);
      console.log(localStorage.getItem("token"));
    } else {
      console.error("Ошибка логина:", data.message);
    }
  } catch (error) {
    console.log(error);
  }
});

change.addEventListener("click", async () => {
  try {
    const response = await fetch(url + "/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: "newPassword",
        username: "Yana",
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
});

deleteAcc.addEventListener("click", async () => {
  try {
    const response = await fetch(url + "/delete-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: "12345",
        username: "Yana",
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
});

admin.addEventListener("click", async () => {
  try {
    const token = localStorage.getItem("token");
    console.log(localStorage.getItem("token"));

    if (!token) {
      console.log("Токен не найден");
      return;
    }
    const response = await fetch(url + "/admin", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      console.log("Доступ разрешен:", data);
    } else {
      console.log("Ошибка доступа:", data.message);
    }
    return data;
  } catch (error) {
    console.log(error);
  }
});

// profile.addEventListener("click", async () => {
//   try {
//     const profileURl = url + "/profile/";
//     const profileId = 1;
//     const response = await fetch(profileURl + profileId);
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// });

// update.addEventListener("click", async () => {
//   try {
//     const profileURl = url + "/profile/";
//     const profileId = 1;
//     const response = await fetch(profileURl + profileId, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         email: "1235@gmail.com",
//         username: "Yana10",
//       }),
//     });
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// });
