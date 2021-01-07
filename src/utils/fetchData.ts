import axios from 'axios'

export default async function fetchData(
  url: string
): Promise<Record<string, unknown>> {
  const res = await axios.get<Record<string, unknown>>(url)

  if (Object.keys(res.data).length < 1) {
    throw new Error("Couldn't load the data from API.")
  } else {
    return res.data
  }
}
