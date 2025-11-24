
export const LANGUAGE_TEMPLATES: Record<string, string> = {
    typescript: `// TypeScript Hello World
function helloWorld() {
  console.log("Hello, TypeScript!");
}

helloWorld();`,
    javascript: `// JavaScript Hello World
function helloWorld() {
  console.log("Hello, JavaScript!");
}

helloWorld();`,
    python: `# Python Hello World
def hello_world():
    print("Hello, Python!")

hello_world()`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`,
    csharp: `// C# Hello World
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, C#!");
    }
}`,
    cpp: `// C++ Hello World
#include <iostream>

int main() {
    std::cout << "Hello, C++!" << std::endl;
    return 0;
}`,
    go: `// Go Hello World
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}`,
    ruby: `# Ruby Hello World
def hello_world
  puts "Hello, Ruby!"
end

hello_world`,
    php: `<?php
// PHP Hello World
echo "Hello, PHP!";
?>`,
    swift: `// Swift Hello World
print("Hello, Swift!")`,
    kotlin: `// Kotlin Hello World
fun main() {
    println("Hello, Kotlin!")
}`,
    rust: `// Rust Hello World
fn main() {
    println!("Hello, Rust!");
}`,
    scala: `// Scala Hello World
object Main extends App {
  println("Hello, Scala!")
}`,
    perl: `# Perl Hello World
print "Hello, Perl!\\n";`,
    lua: `-- Lua Hello World
print("Hello, Lua!")`,
    r: `# R Hello World
cat("Hello, R!\\n")`,
    dart: `// Dart Hello World
void main() {
  print('Hello, Dart!');
}`,
    haskell: `-- Haskell Hello World
main :: IO ()
main = putStrLn "Hello, Haskell!"`,
    elixir: `# Elixir Hello World
IO.puts "Hello, Elixir!"`,
    clojure: `; Clojure Hello World
(println "Hello, Clojure!")`,
    fsharp: `// F# Hello World
printfn "Hello, F#!"`,
    groovy: `// Groovy Hello World
println "Hello, Groovy!"`
};

// Mapping editor language IDs to Piston API language names and versions
// Versions are just indicative, Piston usually picks the latest installed
export const PISTON_RUNTIMES: Record<string, { language: string, version: string }> = {
    java: { language: 'java', version: '15.0.2' },
    csharp: { language: 'csharp', version: '6.12.0' },
    cpp: { language: 'cpp', version: '10.2.0' },
    go: { language: 'go', version: '1.16.2' },
    ruby: { language: 'ruby', version: '3.0.1' },
    php: { language: 'php', version: '8.2.3' },
    swift: { language: 'swift', version: '5.3.3' },
    kotlin: { language: 'kotlin', version: '1.8.20' },
    rust: { language: 'rust', version: '1.68.2' },
    python: { language: 'python', version: '3.10.0' }, // Fallback if Pyodide fails or for consistency if preferred
    javascript: { language: 'javascript', version: '18.15.0' }, // Fallback
    typescript: { language: 'typescript', version: '5.0.3' }, // Fallback
    scala: { language: 'scala', version: '3.2.2' },
    perl: { language: 'perl', version: '5.36.0' },
    lua: { language: 'lua', version: '5.4.4' },
    r: { language: 'rscript', version: '4.1.1' },
    dart: { language: 'dart', version: '2.19.6' },
    haskell: { language: 'haskell', version: '9.0.1' },
    elixir: { language: 'elixir', version: '1.11.3' },
    clojure: { language: 'clojure', version: '1.10.3' },
    fsharp: { language: 'fsharp.net', version: '5.0.201' },
    groovy: { language: 'groovy', version: '3.0.7' },
};

export interface PistonResponse {
    language: string;
    version: string;
    run: {
        stdout: string;
        stderr: string;
        output: string;
        code: number;
        signal: string | null;
    };
    compile?: {
        stdout: string;
        stderr: string;
        output: string;
        code: number;
        signal: string | null;
    };
}

export const executePistonCode = async (language: string, code: string, stdin: string = ''): Promise<PistonResponse> => {
    const runtime = PISTON_RUNTIMES[language];
    if (!runtime) {
        throw new Error(`Unsupported language for execution: ${language}`);
    }

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [
                {
                    content: code,
                },
            ],
            stdin: stdin,
        }),
    });

    if (!response.ok) {
        throw new Error(`Piston API error: ${response.statusText}`);
    }

    return await response.json();
};
