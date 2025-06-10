import { XMLParser, XMLBuilder} from "fast-xml-parser";

const voyageDocsBaseUrl = "https://docs.voyageai.com/";

async function getSitemap() {
  // 1. Download the XML file 
  const response = await fetch("https://docs.voyageai.com/sitemap.xml");

  // contents blob
  const sitemapBlob = await response.blob();

  // blob to string/xml
  const parser = new XMLParser();
  const sitemapParsedJson = parser.parse(await sitemapBlob.text());

  // expect sitemapParsedJson to have urlset w nonzero urls w loc
  // TODO

  console.log(sitemapParsedJson.urlset.url[0]);

  return sitemapParsedJson.urlset;
}

getSitemap(); 


// 2. Extract  all the url loc from the sitemap XML file you downloaded
