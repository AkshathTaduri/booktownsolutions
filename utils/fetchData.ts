export async function fetchData<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("FetchData Error:", error);
      throw error;
    }
  }
  