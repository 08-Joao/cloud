import axios from "axios";

const backendRoute = axios.create({
    baseURL: "http://localhost:4001/api",
    withCredentials: true
})


export default backendRoute