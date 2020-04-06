import {NODE_SERVER_URL, BACKEND_SERVER_URL} from "../config"

export const getRequest = (url, callback) => {
  fetch(NODE_SERVER_URL + url)
    .then(response => response.json())
    .then(response => callback(response))
    .catch(error => console.log(error));
};

export const postRequest = (url, body, callback) => {
  fetch(`${BACKEND_SERVER_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  })
    .then(response => response.json())
    .then(response => callback(response))
    .catch(error => console.log(error));
};