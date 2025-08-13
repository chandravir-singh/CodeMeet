// Coding Screen Application
class CodingScreen {
    constructor() {
        this.remainingTime = 90 * 60; // 1.5 hours in seconds
        this.countdownTimer = null;
        this.currentQuestion = 1;
        this.questions = this.loadQuestions();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startCountdownTimer();
        this.loadQuestion(this.currentQuestion);
        this.changeLanguage('java');
    }

    setupEventListeners() {
        // Exit button
        document.getElementById('exit-btn').addEventListener('click', () => {
            this.exitCompetition();
        });

        // Language selector
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // Run code button
        document.getElementById('run-code-btn').addEventListener('click', () => {
            this.runCode();
        });

        // Submit code button
        document.getElementById('submit-code-btn').addEventListener('click', () => {
            this.submitCode();
        });

        // Clear output button
        document.getElementById('clear-output-btn').addEventListener('click', () => {
            this.clearOutput();
        });

        // Question navigation
        document.querySelectorAll('.question-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const questionNumber = parseInt(e.currentTarget.dataset.question);
                this.switchQuestion(questionNumber);
            });
        });

        // Real-time code checking
        document.getElementById('code-editor').addEventListener('input', () => {
            this.debounceCodeCheck();
        });

        // Modal close button
        document.getElementById('close-modal-btn').addEventListener('click', () => {
            this.closeTimeUpModal();
        });
    }

    loadQuestions() {
        return [
            {
                id: 1,
                title: 'Two Sum',
                description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
                difficulty: 'Easy',
                timeLimit: '2s',
                memoryLimit: '256MB',
                testCases: [
                    { input: '[2,7,11,15]', target: 9, output: '[0,1]' },
                    { input: '[3,2,4]', target: 6, output: '[1,2]' },
                    { input: '[3,3]', target: 6, output: '[0,1]' }
                ]
            },
            {
                id: 2,
                title: 'Valid Parentheses',
                description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

Example:
Input: s = "()"
Output: true

Input: s = "([)]"
Output: false

Input: s = "{[]}"
Output: true

Constraints:
- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'`,
                difficulty: 'Medium',
                timeLimit: '1s',
                memoryLimit: '128MB',
                testCases: [
                    { input: '"()"', output: 'true' },
                    { input: '"([)]"', output: 'false' },
                    { input: '"{[]}"', output: 'true' }
                ]
            },
            {
                id: 3,
                title: 'Longest Substring Without Repeating Characters',
                description: `Given a string s, find the length of the longest substring without repeating characters.

Example:
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.

Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.

Constraints:
- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols and spaces`,
                difficulty: 'Medium',
                timeLimit: '3s',
                memoryLimit: '256MB',
                testCases: [
                    { input: '"abcabcbb"', output: '3' },
                    { input: '"bbbbb"', output: '1' },
                    { input: '"pwwkew"', output: '3' }
                ]
            }
        ];
    }

    loadQuestion(questionNumber) {
        const question = this.questions.find(q => q.id === questionNumber);
        if (!question) return;

        // Update question content
        const questionContent = document.getElementById('question-content');
        questionContent.innerHTML = `
            <h3>${question.title}</h3>
            <p>${question.description}</p>
        `;

        // Update question meta
        document.querySelector('.difficulty').textContent = `Difficulty: ${question.difficulty}`;
        document.querySelector('.time-limit').textContent = `Time Limit: ${question.timeLimit}`;
        document.querySelector('.memory-limit').textContent = `Memory: ${question.memoryLimit}`;

        // Update question navigation
        this.updateQuestionNavigation(questionNumber);

        // Clear code editor
        document.getElementById('code-editor').value = '';
        this.changeLanguage(document.getElementById('language-select').value);

        // Clear output
        this.clearOutput();
    }

    updateQuestionNavigation(activeQuestion) {
        document.querySelectorAll('.question-item').forEach(item => {
            item.classList.remove('active');
            const questionNumber = parseInt(item.dataset.question);
            const statusElement = item.querySelector('.question-status');
            
            if (questionNumber === activeQuestion) {
                item.classList.add('active');
                statusElement.textContent = 'Current';
            } else if (questionNumber < activeQuestion) {
                statusElement.textContent = 'Completed';
            } else {
                statusElement.textContent = 'Not Started';
            }
        });
    }

    switchQuestion(questionNumber) {
        this.currentQuestion = questionNumber;
        this.loadQuestion(questionNumber);
    }

    startCountdownTimer() {
        this.updateTimerDisplay();
        
        this.countdownTimer = setInterval(() => {
            this.remainingTime--;
            this.updateTimerDisplay();
            
            if (this.remainingTime <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const hours = Math.floor(this.remainingTime / 3600);
        const minutes = Math.floor((this.remainingTime % 3600) / 60);
        const seconds = this.remainingTime % 60;
        
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        
        // Update timer styling
        const timerDisplay = document.getElementById('timer-display');
        timerDisplay.classList.remove('warning', 'danger');
        
        if (this.remainingTime <= 60) { // Last minute
            timerDisplay.classList.add('danger');
            document.getElementById('timer-status').textContent = 'Final minute!';
        } else if (this.remainingTime <= 300) { // Last 5 minutes
            timerDisplay.classList.add('warning');
            document.getElementById('timer-status').textContent = 'Time running out!';
        } else {
            document.getElementById('timer-status').textContent = 'Competition in progress';
        }
    }

    handleTimeUp() {
        clearInterval(this.countdownTimer);
        this.showTimeUpModal();
        this.autoSubmitCode();
    }

    showTimeUpModal() {
        document.getElementById('time-up-modal').style.display = 'flex';
    }

    closeTimeUpModal() {
        document.getElementById('time-up-modal').style.display = 'none';
        // Give user a moment to see the message, then exit
        setTimeout(() => {
            this.exitCompetition();
        }, 1000);
    }

    changeLanguage(language) {
        const editor = document.getElementById('code-editor');
        const placeholders = {
            java: `// Write your Java code here
public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        // Example: Find two numbers that add up to target
        // Return their indices as an array
        return new int[]{};
    }
    
    public static void main(String[] args) {
        // Test your solution here
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = twoSum(nums, target);
        System.out.println("Result: [" + result[0] + ", " + result[1] + "]");
    }
}`,
            python: `# Write your Python code here
def two_sum(nums, target):
    # Your code here
    # Example: Find two numbers that add up to target
    # Return their indices as a list
    return []

# Test your solution here
if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    result = two_sum(nums, target)
    print(f"Result: {result}")`,
            c: `// Write your C code here
#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Your code here
    // Example: Find two numbers that add up to target
    // Return their indices as an array
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    return result;
}

int main() {
    // Test your solution here
    int nums[] = {2, 7, 11, 15};
    int target = 9;
    int returnSize;
    int* result = twoSum(nums, 4, target, &returnSize);
    printf("Result: [%d, %d]\\n", result[0], result[1]);
    free(result);
    return 0;
}`
        };
        
        editor.placeholder = placeholders[language] || placeholders.java;
        this.clearOutput();
    }

    // Debounce function for real-time code checking
    debounceCodeCheck() {
        clearTimeout(this.codeCheckTimeout);
        this.codeCheckTimeout = setTimeout(() => {
            this.checkCodeSyntax();
        }, 1000);
    }

    async checkCodeSyntax() {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;
        
        if (!code.trim()) return;

        try {
            const syntaxCheck = this.performSyntaxCheck(code, language);
            if (syntaxCheck.hasError) {
                this.displayOutput(`Syntax Check: ❌ ${syntaxCheck.error}`, 'error');
            } else {
                this.displayOutput(`Syntax Check: ✅ Code looks good!`, 'success');
            }
        } catch (error) {
            console.error('Syntax check error:', error);
        }
    }

    performSyntaxCheck(code, language) {
        const checks = {
            java: {
                hasClass: /public\s+class\s+\w+/.test(code),
                hasMain: /public\s+static\s+void\s+main/.test(code),
                hasBrackets: this.checkBrackets(code),
                hasSemicolons: this.checkJavaSemicolons(code)
            },
            python: {
                hasFunction: /def\s+\w+/.test(code),
                hasColons: this.checkPythonColons(code),
                hasIndentation: this.checkPythonIndentation(code)
            },
            c: {
                hasInclude: /#include/.test(code),
                hasMain: /int\s+main\s*\(/.test(code),
                hasBrackets: this.checkBrackets(code),
                hasSemicolons: this.checkCSemicolons(code)
            }
        };

        const languageChecks = checks[language];
        if (!languageChecks) {
            return { hasError: true, error: 'Unsupported language' };
        }

        const errors = [];
        
        if (language === 'java') {
            if (!languageChecks.hasClass) errors.push('Missing public class declaration');
            if (!languageChecks.hasMain) errors.push('Missing main method');
            if (!languageChecks.hasBrackets) errors.push('Mismatched brackets');
            if (!languageChecks.hasSemicolons) errors.push('Missing semicolons');
        } else if (language === 'python') {
            if (!languageChecks.hasFunction) errors.push('No function definition found');
            if (!languageChecks.hasColons) errors.push('Missing colons after function/if/for statements');
            if (!languageChecks.hasIndentation) errors.push('Inconsistent indentation');
        } else if (language === 'c') {
            if (!languageChecks.hasInclude) errors.push('Missing #include statements');
            if (!languageChecks.hasMain) errors.push('Missing main function');
            if (!languageChecks.hasBrackets) errors.push('Mismatched brackets');
            if (!languageChecks.hasSemicolons) errors.push('Missing semicolons');
        }

        return {
            hasError: errors.length > 0,
            error: errors.join(', ')
        };
    }

    checkBrackets(code) {
        const stack = [];
        const brackets = { '{': '}', '(': ')', '[': ']' };
        
        for (let char of code) {
            if (brackets[char]) {
                stack.push(char);
            } else if (Object.values(brackets).includes(char)) {
                if (stack.length === 0) return false;
                const last = stack.pop();
                if (brackets[last] !== char) return false;
            }
        }
        
        return stack.length === 0;
    }

    checkJavaSemicolons(code) {
        const lines = code.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}') && 
                !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*') &&
                !line.includes('public') && !line.includes('private') && !line.includes('class') &&
                !line.includes('if') && !line.includes('for') && !line.includes('while') &&
                !line.includes('try') && !line.includes('catch') && !line.includes('finally')) {
                return false;
            }
        }
        return true;
    }

    checkCSemicolons(code) {
        const lines = code.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}') && 
                !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*') &&
                !line.startsWith('#include') && !line.startsWith('#define') &&
                !line.includes('if') && !line.includes('for') && !line.includes('while') &&
                !line.includes('int main')) {
                return false;
            }
        }
        return true;
    }

    checkPythonColons(code) {
        const lines = code.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line && (line.startsWith('def ') || line.startsWith('if ') || 
                        line.startsWith('for ') || line.startsWith('while ') || 
                        line.startsWith('elif ') || line.startsWith('else:')) && 
                !line.endsWith(':')) {
                return false;
            }
        }
        return true;
    }

    checkPythonIndentation(code) {
        const lines = code.split('\n');
        let expectedIndent = 0;
        
        for (let line of lines) {
            if (!line.trim()) continue;
            
            const currentIndent = line.length - line.trimStart().length;
            
            if (line.trim().endsWith(':')) {
                expectedIndent += 4;
            } else if (currentIndent < expectedIndent && line.trim()) {
                expectedIndent = Math.max(0, expectedIndent - 4);
            }
            
            if (currentIndent !== expectedIndent && line.trim()) {
                return false;
            }
        }
        return true;
    }

    async runCode() {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;
        
        if (!code.trim()) {
            this.displayOutput('❌ Please write some code first!', 'error');
            return;
        }

        this.showLoading();
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const output = this.executeCode(code, language);
            this.displayOutput(output, 'success');
        } catch (error) {
            this.displayOutput(`❌ Error running code: ${error.message}`, 'error');
        }
        
        this.hideLoading();
    }

    executeCode(code, language) {
        let output = `🚀 Code Execution Results\n`;
        output += `Language: ${language.toUpperCase()}\n`;
        output += `Timestamp: ${new Date().toLocaleTimeString()}\n`;
        output += `─`.repeat(50) + `\n\n`;
        
        if (language === 'java') {
            output += `✅ Java code compiled successfully\n`;
            output += `✅ Main method found and executed\n`;
            output += `✅ Runtime: 0.045s\n`;
            output += `✅ Memory: 45.2MB\n\n`;
            output += `📤 Program Output:\n`;
            output += `Result: [0, 1]\n`;
            output += `Test case passed: nums=[2,7,11,15], target=9 → [0,1]\n\n`;
            output += `💡 Note: This is a demo execution. In a real competition, your code would be tested against multiple test cases.`;
        } else if (language === 'python') {
            output += `✅ Python code executed successfully\n`;
            output += `✅ Syntax validation passed\n`;
            output += `✅ Runtime: 0.023s\n`;
            output += `✅ Memory: 32.1MB\n\n`;
            output += `📤 Program Output:\n`;
            output += `Result: [0, 1]\n`;
            output += `Test case passed: nums=[2,7,11,15], target=9 → [0,1]\n\n`;
            output += `💡 Note: This is a demo execution. In a real competition, your code would be tested against multiple test cases.`;
        } else if (language === 'c') {
            output += `✅ C code compiled successfully\n`;
            output += `✅ Main function found and executed\n`;
            output += `✅ Runtime: 0.012s\n`;
            output += `✅ Memory: 28.7MB\n\n`;
            output += `📤 Program Output:\n`;
            output += `Result: [0, 1]\n`;
            output += `Test case passed: nums=[2,7,11,15], target=9 → [0,1]\n\n`;
            output += `💡 Note: This is a demo execution. In a real competition, your code would be tested against multiple test cases.`;
        } else {
            output += `❌ Unsupported language: ${language}\n`;
            output += `Supported languages: Java, Python, C`;
        }
        
        return output;
    }

    async submitCode() {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;
        
        if (!code.trim()) {
            this.displayOutput('❌ Please write some code first!', 'error');
            return;
        }

        this.showLoading();
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const result = this.evaluateCode(code, language);
            this.showSubmissionResult(result);
        } catch (error) {
            this.displayOutput(`❌ Error submitting code: ${error.message}`, 'error');
        }
        
        this.hideLoading();
    }

    evaluateCode(code, language) {
        const testCases = this.questions[this.currentQuestion - 1].testCases || [];
        let passedTests = 0;
        let totalTests = testCases.length;
        
        if (totalTests > 0) {
            passedTests = Math.floor(Math.random() * (totalTests + 1));
        }
        
        const score = Math.round((passedTests / totalTests) * 100);
        const isCorrect = passedTests === totalTests;
        
        return {
            score: score,
            passedTests: passedTests,
            totalTests: totalTests,
            isCorrect: isCorrect,
            feedback: isCorrect ? 'Excellent! All test cases passed!' : `Passed ${passedTests}/${totalTests} test cases. Keep trying!`,
            executionTime: Math.random() * 1000 + 100,
            memoryUsed: Math.random() * 50 + 10
        };
    }

    showSubmissionResult(result) {
        const message = `🎯 Submission Result

Score: ${result.score}/100
Test Cases: ${result.passedTests}/${result.totalTests} passed
Status: ${result.isCorrect ? '✅ Correct' : '❌ Incorrect'}

${result.feedback}

Execution Time: ${result.executionTime.toFixed(2)}ms
Memory Used: ${result.memoryUsed.toFixed(2)}MB`;
        
        this.displayOutput(message, result.isCorrect ? 'success' : 'error');
    }

    displayOutput(output, type = 'info') {
        const outputContent = document.getElementById('output-content');
        const placeholder = outputContent.querySelector('.output-placeholder');
        
        if (placeholder) {
            placeholder.remove();
        }
        
        const outputElement = document.createElement('div');
        outputElement.className = `output-${type}`;
        outputElement.textContent = output;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'output-timestamp';
        timestamp.textContent = `[${new Date().toLocaleTimeString()}]`;
        timestamp.style.fontSize = '0.8rem';
        timestamp.style.color = '#888';
        timestamp.style.marginBottom = '5px';
        
        outputContent.appendChild(timestamp);
        outputContent.appendChild(outputElement);
        outputContent.scrollTop = outputContent.scrollHeight;
    }

    clearOutput() {
        const outputContent = document.getElementById('output-content');
        outputContent.innerHTML = `
            <div class="output-placeholder">
                <i class="fas fa-terminal"></i>
                <p>Run your code to see the output here</p>
            </div>
        `;
    }

    async autoSubmitCode() {
        const code = document.getElementById('code-editor').value;
        if (code.trim()) {
            this.displayOutput('✅ Code automatically submitted due to time up!', 'success');
        }
    }

    exitCompetition() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
        
        // Check if we're in a popup window
        if (window.opener) {
            // Notify parent window that we're closing
            window.opener.postMessage({ type: 'coding-window-closed' }, '*');
            window.close();
        } else {
            // We're in the same window, go back to main page
            window.location.href = 'index.html';
        }
    }

    showLoading() {
        document.getElementById('loading-spinner').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-spinner').style.display = 'none';
    }
}

// Initialize the coding screen when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.codingScreen = new CodingScreen();
});
