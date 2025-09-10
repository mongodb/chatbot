import puppeteer from "puppeteer";

const SKILL_HOMEPAGE_URL = "https://learn.mongodb.com/skills";
const EXPECTED_ELEMENT_ID = "vite-plugin-ssr_pageContext";
const EXPECTED_JSON_PATH = "pageContext.pageProps.storefrontData.topics";

export type Skill = {
  name: string;
  description: string;
  url: string;
  metadata?: {
    [name: string]: string;
  };
};

export type TopicsToSkills = {
  [topic: string]: Skill[]; // TODO - consider making this an object.
};

export async function getCurrentSkills() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Navigate to MongoDB Skills Homepage
    await page.goto(SKILL_HOMEPAGE_URL, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Extract JSON from the vite-plugin-ssr_pageContext element
    const skillsData = await page.evaluate(() => {
      const element = document.getElementById(EXPECTED_ELEMENT_ID);
      if (!element) {
        throw new Error(`Element with ID "${EXPECTED_ELEMENT_ID}" not found`);
      }

      try {
        const jsonData = JSON.parse(element.textContent || element.innerText);
        return jsonData;
      } catch (parseError) {
        throw new Error(
          "Failed to parse JSON from page context element: " + parseError
        );
      }
    });

    return extractTopicToSkillsFromPageData(skillsData);
  } catch (error) {
    console.error("Error scraping skills data:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedValue(obj: any, path: string): any {
  // Navigate to the expected JSON path.
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTopicToSkillsFromPageData(pageData: any): TopicsToSkills {
  try {
    const topics = getNestedValue(pageData, EXPECTED_JSON_PATH);

    if (!topics || !Array.isArray(topics)) {
      throw new Error(
        `Topics data not found at expected path: ${EXPECTED_JSON_PATH}`
      );
    }

    const topicsToSkillsMap: TopicsToSkills = {};

    for (const topic of topics) {
      if (!topic.title || !topic.skills) {
        // Something about this topic is malformed
        continue;
      }

      const skills: Skill[] = [];
      for (const skill of topic.skills) {
        if (skill.name && skill.description && skill.url) {
          skills.push({
            name: skill.title,
            description: skill.description,
            url: skill.url,
          });
        }
      }

      if (skills.length > 0) {
        topicsToSkillsMap[topic.title] = skills;
      }
    }

    return topicsToSkillsMap;
  } catch (error) {
    console.error("Error extracting topic to skills data:", error);
    throw new Error(`Failed to extract skills data from JSON: ${error}`);
  }
}
