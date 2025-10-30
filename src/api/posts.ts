import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

export type Post = {
    userId: number,
    id: number,
    title: string,
    body: string
}

export const getPosts = async (): Promise<Post[]> => {
  const response = await axios.get<Post[]>("https://jsonplaceholder.typicode.com/posts");
  return response.data
};


export const createPost = async (): Promise<Post> => {
  const response = await axios.post<Post>("https://jsonplaceholder.typicode.com/posts");
  return response.data
};

export const useCreatePost = () => {
    return useMutation({
        mutationFn: createPost
    })
}
