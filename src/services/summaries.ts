interface Video {
  title: string;
  description: string;
}
export async function getPlaylistSummary(videos: Video[]): Promise<string> {
  try {
    // The URL for the backend's summarization endpoint
    const backendUrl = "/api/summarize";

    // We only send 'title' and 'description' as required by the backend.
    const videosToSend = videos.map((video) => ({
      title: video.title,
      description: video.description,
    }));

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videos: videosToSend }),
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! Status: ${response.status}`
      );
    }

    // Parse the JSON response
    const data = await response.json();

    // Return the summary text
    return data.summary;
  } catch (error) {
    console.error("Error fetching playlist summary:", error);
    // Re-throw the error to be handled by the calling component
    throw new Error(
      `Could not generate summary: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
