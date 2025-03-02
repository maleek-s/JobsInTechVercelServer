import axios from "axios";

export const fetchCompanies = async (url) => {
  const response = await axios.get(url);
  return response.data.careers;
};
