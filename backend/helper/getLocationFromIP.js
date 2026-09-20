export const getLocationFromIP = async (ip) => {
  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,city`
    );

    const data = await response.json();

    if (data.status !== "success") {
      return {
        country: null,
        city: null,
      };
    }

    return {
      country: data.country,
      city: data.city,
    };
  } catch (error) {
    console.error("Location API error:", error.message);

    return {
      country: null,
      city: null,
    };
  }
};