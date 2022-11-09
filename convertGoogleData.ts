import { promises as fs } from 'fs';
import path from 'path';    

type Date = {
    month: string;
    year: string;
}

export async function convertGoogleData(date: Date){

    const { month, year } = date;

    const filePath = `../../data/Location History/Semantic Location History/${year}/${year}_${month.toUpperCase()}.json`;

    const data = await fs.readFile(filePath, 'utf8')


    return JSON.parse(data)


}

