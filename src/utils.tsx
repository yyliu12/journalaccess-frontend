import {apiUrl, FileApiResponse, SearchApiResponse, SearchApiResponseFile} from 'api';
import { Dayjs } from 'dayjs';

export function jsonToFormData(json: Record<string, any>): FormData {
    const formData = new FormData();
    for (const key in json) {
        if (json.hasOwnProperty(key)) {
            const value = json[key];
            if (Array.isArray(value)) {
                value.forEach((item) => formData.append(key, item));
            } else {
                formData.append(key, value);
            }
        }
    }
    return formData;
}

export function getUrlForFile(f: FileApiResponse | SearchApiResponseFile): string {
    return `${apiUrl}/files/getFile/${f.date}/${f.path}`;
}

export function formatDayJsDate(date: Dayjs): string {
    return date.format('YYYY-MM-DD');
}


export const debounce = (callback: any, wait: number) => {
    let timeoutId: number | undefined = undefined;
    return (...args: any) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            callback(...args);
        }, wait);
    };
}