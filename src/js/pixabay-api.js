import axios from "axios";

const API_KEY = "39900943-6509e60799bbbff7e734fb1a7";

export async function serviceImagesSearch(searchQuery) {
    const BASE_URL = "https://pixabay.com/api/";
    const searchParams = new URLSearchParams({
        key: API_KEY,
        q: searchQuery,
        image_type: "illustration",
        orientation: "vertical",
        safesearch: true,
        page: 1,
        per_page: 9,
    });

    const response = await axios.get(`${BASE_URL}?${searchParams}`);
    return response.data;
}