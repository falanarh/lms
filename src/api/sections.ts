import axios from "axios";

type Group = {
    id_group_course: string,
    id_course: string,
    id_teacher: string,
    is_open: boolean,
    name: string,
    description: string,
    created_at: Date,
    updated_at: Date
}

type Section  = {
    id_group: string,
    id_section: string,
    name: string,
    description: string,
    content_start: Date,
    content_end: Date,
    sequence: number,
    created_at: Date,
    updated_at: Date,
    group: Group
}

export const getSections = async (): Promise<Section[]> => {
    const response = await axios.get<Section[]>("http://10.101.20.150:3000/sections")
    return response.data
}