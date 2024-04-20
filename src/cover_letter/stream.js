const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

function getCurrentCompany(experience) {
  const currentCompanies = experience.filter(
    (exp) => exp.employment === "current"
  );

  if (currentCompanies.length > 0) {
    return currentCompanies[0].company;
  } else {
    return null;
  }
}

async function handleStream(stream) {
  let response = "";

  for await (const chunk of stream) {
    response += chunk.choices[0]?.delta?.content || "";

    if (chunk.done) {
      break;
    }
  }

  return response;
}

async function OpenAIStream(person) {
  const { name, headline, location, experience, summary } = person;

  const company = getCurrentCompany(experience);

  const prompt = `
I am a co-founder of BandIT, a company specializing in website and application development using modern technologies. I need assistance in composing a cover letter for a proposal regarding SEO automation using AI and scripts. This letter should be addressed to a specific individual at  digital agency, ${name} from ${company}, whom I will introduce to you, and it should emphasize our relevant skills and experience, explaining why our company is an ideal partner for collaboration. The letter should be persuasive, informative, and aimed at capturing the recipient's interest and trust. Please write in a business style, with a hint of formality.`;

  const instruction = `Generate a comprehensive letter that encapsulates the key features and aspects of the subject. 
In the greeting, use a different phrase instead of "I hope this letter finds you well." The letter should be written on behalf co-founder of BandIT Andrij. Utilize the sender company's data: BandIT, a company specializing in developing cutting-edge applications and websites using advanced technologies such as React.js, React Native, Next.js, Generative AI, chatbot support, automated content creation, and personalized recommendations with chat GPT, Midjourney, and Bard. Always conclude the text with: Best regards, https://band-it.space/ Andrij a Co-founder, BandIT.
The letter should be with a minimum word count of 200 words and not exceeding 300 words. 
Focus on clarity and relevance, ensuring the text provides a thorough overview within the specified word limit. All processed prompts' results must strictly adhere to one template without altering the structure and content of the letter critically`;

  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: instruction,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
    // response_format: { type: "json_object" },
    temperature: 1,
    max_tokens: 300,
    // top_p: 1,
    // frequency_penalty: 0,
    // presence_penalty: 0,
  });

  try {
    const completeResponse = await handleStream(stream);

    console.log("completeResponse:", completeResponse);
    return completeResponse;
  } catch (error) {
    console.error("An error occurred:", error);
    return "";
  }
}

module.exports = OpenAIStream;

const someProfile = {
  name: "Mandy Sidana",
  headline: "Product Manager at Psychd Analytics",
  location: "Gurgaon Area, India",
  experience: [
    {
      title: "Product Manager",
      company: "Psychd",
      logo: "https://media.licdn.com/media/AAEAAQAAAAAAAB5AAAAJDNiNDk0ODlkLTIyYTYtNGMxYS05OGQ3LWYwYjM2MmI5NWE1MQ.png",
      dateRange: "Jan 2015 – Present (11 months)",
      location: "Gurgaon Area, India",
      employment: "current",
    },
  ],
  summary: "Product Manager",
  skills: [
    "Product Roadmap",
    "Wireframing",
    "Prototyping",
    "Node.js",
    "JavaScript",
    "CoffeeScript",
    "jQuery",
    "MongoDB",
    "PostgreSQL",
    "Redis",
    "HTML",
    "CSS",
  ],
  education: [
    {
      school: "GGSIPU",
      field: "Bachelor's Degree, Computer Science",
      dateRange: "2006 – 2010",
    },
    {
      school: "The Lawrence School, Sanawar",
      dateRange: "2003 – 2005",
    },
  ],
};

// (async () => {
//   await OpenAIStream(someProfile);
// })();
