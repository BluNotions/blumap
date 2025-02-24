// toxicityCheck.js
async function checkToxicity(text) {
    const apiKey = "AIzaSyAYwrzOaH6eIU63Wwz1TcBZodnjvYV0-_k";
    const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`;
    const requestBody = {
      comment: { text: text },
      languages: ["en"],
      requestedAttributes: { TOXICITY: {} }
    };
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        console.error("Perspective API error:", response.statusText);
        return 0;
      }
      const data = await response.json();
      return data.attributeScores.TOXICITY.summaryScore.value;
    } catch (error) {
      console.error("Error calling Perspective API:", error);
      return 0;
    }
  }
  