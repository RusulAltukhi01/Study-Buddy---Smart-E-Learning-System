export async function generateQuiz(text, numQuestions = 15, quizType = "mixed") {
    const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text,
            num_questions: numQuestions,
            quiz_type: quizType
        })
    });

    const data = await response.json();
    return data;
}