const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type Service = {
  id: number | string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  avg_rating?: number;
  image_url?: string;
};

export async function getServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${API_URL}/services`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error("Failed to fetch services");
    }

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data.services || [];
  } catch (error) {
    console.error("API ERROR:", error);
    return [];
  }
}

export async function getServiceById(id: number | string): Promise<Service | null> {
  try {
    const res = await fetch(`${API_URL}/services/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error("Failed to fetch service");
    }

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data.service || null;
  } catch (error) {
    console.error("API ERROR:", error);
    return null;
  }
}