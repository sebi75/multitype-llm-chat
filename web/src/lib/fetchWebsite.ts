import cheerio from "cheerio";

const fetchWebsite = async (url: string): Promise<WebsiteResponse | null> => {
  const r =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  if (!r.test(url)) {
    throw new Error("Invalid URL");
  }

  try {
    const response = await fetch(url);
    try {
      const html = await response.text();
      const $ = cheerio.load(html);
      const title =
        $("title").text() || $("meta[property='og:title']").attr("content");

      const description =
        $("meta[property='og:description']").attr("content") ||
        $("meta[name='Description']").attr("content");

      const image =
        $('meta[property="og:image"]').attr("content") ||
        $('meta[property="og:image:url"]').attr("content");

      return { title, description, image };
    } catch (error) {
      throw new Error("error parsing html");
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

interface WebsiteResponse {
  title?: string;
  description?: string;
  image?: string;
}

export default fetchWebsite;
