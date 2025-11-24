import { toast } from "sonner";

// Define the API key - in production, you'd want to store this securely
// For this demo, we'll use the provided key directly
// API key is now loaded from .env file

// Types for our API
interface AIRequestOptions {
  text: string;
  maxTokens?: number;
  temperature?: number;
  language?: string;
  apiKey?: string; // Optional custom API key
}

interface AIResponse {
  text: string;
  isError: boolean;
  errorMessage?: string;
}

export async function getAICompletion({
  text,
  maxTokens = 1024,
  temperature = 0.7,
  language = "javascript",
  apiKey
}: AIRequestOptions): Promise<AIResponse> {
  try {
    console.log("Sending AI request with text:", text);

    // Use configured backend URL or default to local
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Try to call the backend API
    try {
      const response = await fetch(`${apiUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          maxTokens,
          temperature
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || response.statusText;
        throw new Error(`Backend error: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      // The backend returns the full Gemini response structure
      const generatedText = data.candidates[0].content.parts[0].text;

      console.log("AI response:", generatedText);

      return {
        text: generatedText,
        isError: false
      };
    } catch (apiError: any) {
      console.error("=== AI API Error Details ===");
      console.error("Error message:", apiError.message);
      console.error("Full error:", apiError);
      console.warn("AI API failed, falling back to simulation:", apiError);

      // If it's a quota error (429), notify the user specifically
      if (apiError.message.includes('429')) {
        toast.error("AI usage limit reached. Please add your own API key in Settings.");
      } else if (apiError.message.includes('403')) {
        toast.error("API key is invalid or restricted. Please check your API key in Settings.");
      } else if (apiError.message.includes('400')) {
        toast.error("Invalid API request. Please check your API key in Settings.");
      } else {
        toast.error(`AI service error: ${apiError.message}. Please check your API key in Settings.`);
      }

      // Fallback simulation logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

      let simulatedResponse = "";
      if (text.toLowerCase().includes("error") || text.toLowerCase().includes("fix")) {
        // Provide language-specific generic fix structures
        if (language.toLowerCase() === "python") {
          simulatedResponse = `# Offline Mode: Unable to reach AI server.
# Here is a generic fix structure for Python:

def fixed_function():
    try:
        # Your code logic here
        print("Fixed execution")
    except Exception as e:
        print(f"Error handled: {e}")

fixed_function()`;
        } else if (language.toLowerCase() === "javascript" || language.toLowerCase() === "typescript") {
          simulatedResponse = `// Offline Mode: Unable to reach AI server.
// Here is a generic fix structure for JavaScript/TypeScript:

function fixedFunction() {
    try {
        // Your code logic here
        console.log("Fixed execution");
    } catch (error) {
        console.error("Error handled:", error);
    }
}

fixedFunction();`;
        } else if (language.toLowerCase() === "java") {
          simulatedResponse = `// Offline Mode: Unable to reach AI server.
// Here is a generic fix structure for Java:

public class FixedCode {
    public static void main(String[] args) {
        try {
            // Your code logic here
            System.out.println("Fixed execution");
        } catch (Exception e) {
            System.err.println("Error handled: " + e.getMessage());
        }
    }
}`;
        } else if (language.toLowerCase() === "csharp" || language.toLowerCase() === "c#") {
          simulatedResponse = `// Offline Mode: Unable to reach AI server.
// Here is a generic fix structure for C#:

using System;

class FixedCode {
    static void Main() {
        try {
            // Your code logic here
            Console.WriteLine("Fixed execution");
        } catch (Exception e) {
            Console.Error.WriteLine($"Error handled: {e.Message}");
        }
    }
}`;
        } else if (language.toLowerCase() === "cpp" || language.toLowerCase() === "c++") {
          simulatedResponse = `// Offline Mode: Unable to reach AI server.
// Here is a generic fix structure for C++:

#include <iostream>
#include <exception>

int main() {
    try {
        // Your code logic here
        std::cout << "Fixed execution" << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Error handled: " << e.what() << std::endl;
    }
    return 0;
}`;
        } else if (language.toLowerCase() === "go") {
          simulatedResponse = `// Offline Mode: Unable to reach AI server.
// Here is a generic fix structure for Go:

package main

import (
    "fmt"
    "log"
)

func main() {
    defer func() {
        if r := recover(); r != nil {
            log.Println("Error handled:", r)
        }
    }()
    
    // Your code logic here
    fmt.Println("Fixed execution")
}`;
        } else if (language.toLowerCase() === "rust") {
          simulatedResponse = `// Offline Mode: Unable to reach AI server.
// Here is a generic fix structure for Rust:

fn main() {
    match fixed_function() {
        Ok(_) => println!("Fixed execution"),
        Err(e) => eprintln!("Error handled: {}", e),
    }
}

fn fixed_function() -> Result<(), Box<dyn std::error::Error>> {
    // Your code logic here
    Ok(())
}`;
        } else if (language.toLowerCase() === "php") {
          simulatedResponse = `<?php
// Offline Mode: Unable to reach AI server.
// Here is a generic fix structure for PHP:

function fixedFunction() {
    try {
        // Your code logic here
        echo "Fixed execution\\n";
    } catch (Exception $e) {
        error_log("Error handled: " . $e->getMessage());
    }
}

fixedFunction();
?>`;
        } else if (language.toLowerCase() === "ruby") {
          simulatedResponse = `# Offline Mode: Unable to reach AI server.
# Here is a generic fix structure for Ruby:

def fixed_function
  begin
    # Your code logic here
    puts "Fixed execution"
  rescue StandardError => e
    puts "Error handled: #{e.message}"
  end
end

fixed_function`;
        } else if (language.toLowerCase() === "swift") {
          simulatedResponse = `// Offline Mode: Unable to reach AI server.
// Here is a generic fix structure for Swift:

func fixedFunction() {
    do {
        // Your code logic here
        print("Fixed execution")
    } catch {
        print("Error handled: \\(error)")
    }
}

fixedFunction()`;
        } else if (language.toLowerCase() === "kotlin") {
          simulatedResponse = `// Offline Mode: Unable to reach AI server.
// Here is a generic fix structure for Kotlin:

fun main() {
    try {
        // Your code logic here
        println("Fixed execution")
    } catch (e: Exception) {
        System.err.println("Error handled: ${e.message}")
    }
}`;
        } else {
          simulatedResponse = `// Offline Mode: Unable to reach AI server.
// Generic fix: Please check your code for syntax errors and try again.`;
        }
      } else {
        simulatedResponse = "// AI service is currently unavailable. Please try again later.";
      }

      toast.warning("AI service unavailable. Showing offline template.");

      return {
        text: simulatedResponse,
        isError: false
      };
    }
  } catch (error: any) {
    console.error("Unexpected error in getAICompletion:", error);
    return {
      text: "",
      isError: true,
      errorMessage: error.message || "An unexpected error occurred"
    };
  }
}
