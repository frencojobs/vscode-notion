import axios from 'axios'

export default async function fetchData(
  api: string,
  id: string
): Promise<NotionData> {
  if (!api.trim()) {
    throw new Error("API URL can't be empty.")
  }

  const res = await axios.get<NotionData>(`${api}/v1/page/${id}`)

  if (Object.keys(res.data).length < 1) {
    throw new Error("Couldn't load the data from API.")
  } else {
    return res.data
  }
}
