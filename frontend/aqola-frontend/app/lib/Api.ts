import axios from "axios";
import { School } from "./ApiModels";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

export const hello = async () => {
  const response = await api.get(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  );
  return response.data;
};

export const getSchools = async (): Promise<School[]> => {
  const response = await api.get("/school/");
  return response.data;
};
