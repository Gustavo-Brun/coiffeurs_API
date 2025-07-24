const apiBaseUrl = process.env.API_BASE_URL;

export default function pingRoot() {
  setInterval(async () => {
    await fetch(`${apiBaseUrl}`, {
      method: 'GET'
    })
      .then((res) => {
        console.log(`{Pinged at ${new Date().toISOString()}: Status Code ${res.status}}`);
      })
      .catch(() => {
        pingRoot();
      });
  }, 840000); // 14 min
}
