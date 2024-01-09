import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL

export async function getData(path) {
    const res = await axios.get(BASE_URL + path)

    return res
}

export async function postData(path, body) {
    const res = await axios.post(BASE_URL + path, body)

    return res
}

export async function deleteData(path, config) {
    const res = await axios.delete(BASE_URL + path, config)

    return res
}