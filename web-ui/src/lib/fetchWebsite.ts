import cheerio from "cheerio";

const fetchWebsite = async (url: string): Promise<WebsiteResponse | null> => {
  //validate url
  const r =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  if (!r.test(url)) {
    throw new Error("Invalid URL");
  }

  try {
    console.log("Calling fetchWebsite with url: " + url + "...");
    const response = await fetch(url);
    try {
      //get the html text from the response
      const html = await response.text();
      //load the html into cheerio
      const $ = cheerio.load(html);
      //get the title of the page either with title tag or meta og:title property
      const title =
        $("title").text() || $("meta[property='og:title']").attr("content");

      //get the description of the page either with meta og:description property or meta description property
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
    //should see what we get returned for non existent url
    //so we can throw a custom not found error
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
