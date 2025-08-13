// Demo Data for CodeCompete Platform
// Use this data to populate your Firestore database for testing

const demoData = {
    // Sample Events
    events: [
        {
            id: 'event-001',
            title: 'Code Sprint 2024',
            description: 'A fast-paced coding competition with algorithmic challenges. Test your problem-solving skills against the best coders in a time-limited environment.',
            status: 'active',
            startDate: '2024-01-15',
            endDate: '2024-01-20',
            participants: 150,
            maxParticipants: 200,
            createdAt: new Date('2024-01-10'),
            rules: [
                'Individual participation only',
                'No external resources allowed',
                'Time limit: 3 hours',
                'Maximum 5 submissions per problem'
            ]
        },
        {
            id: 'event-002',
            title: 'Algorithm Masters',
            description: 'Advanced algorithmic challenges for experienced programmers. Push your limits with complex problem-solving and optimization techniques.',
            status: 'upcoming',
            startDate: '2024-02-01',
            endDate: '2024-02-05',
            participants: 75,
            maxParticipants: 100,
            createdAt: new Date('2024-01-15'),
            rules: [
                'Team participation (2-3 members)',
                'Advanced algorithms focus',
                'Time limit: 5 hours',
                'Dynamic scoring based on efficiency'
            ]
        },
        {
            id: 'event-003',
            title: 'Web Development Challenge',
            description: 'Build amazing web applications in this creative coding competition. Show off your frontend and backend skills with real-world projects.',
            status: 'upcoming',
            startDate: '2024-02-15',
            endDate: '2024-02-20',
            participants: 45,
            maxParticipants: 80,
            createdAt: new Date('2024-01-20'),
            rules: [
                'Individual or team (max 3)',
                'Full-stack development',
                'Time limit: 48 hours',
                'Deploy to live environment'
            ]
        },
        {
            id: 'event-004',
            title: 'Data Science Hackathon',
            description: 'Solve real-world problems using data science and machine learning. Work with large datasets and create innovative solutions.',
            status: 'upcoming',
            startDate: '2024-03-01',
            endDate: '2024-03-03',
            participants: 60,
            maxParticipants: 120,
            createdAt: new Date('2024-01-25'),
            rules: [
                'Team participation (2-4 members)',
                'Data analysis and ML focus',
                'Time limit: 36 hours',
                'Present findings to judges'
            ]
        }
    ],

    // Sample Questions
    questions: [
        {
            id: 'q-001',
            eventId: 'event-001',
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
            points: 100,
            category: 'Arrays',
            testCases: [
                { input: '[2,7,11,15]', target: 9, output: '[0,1]' },
                { input: '[3,2,4]', target: 6, output: '[1,2]' },
                { input: '[3,3]', target: 6, output: '[0,1]' },
                { input: '[1,5,8,10,13]', target: 18, output: '[3,4]' }
            ],
            createdAt: new Date('2024-01-10')
        },
        {
            id: 'q-002',
            eventId: 'event-001',
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
            points: 150,
            category: 'Stack',
            testCases: [
                { input: '"()"', output: 'true' },
                { input: '"([)]"', output: 'false' },
                { input: '"{[]}"', output: 'true' },
                { input: '"((("', output: 'false' },
                { input: '"[{()}]"', output: 'true' }
            ],
            createdAt: new Date('2024-01-10')
        },
        {
            id: 'q-003',
            eventId: 'event-001',
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
            points: 200,
            category: 'Strings',
            testCases: [
                { input: '"abcabcbb"', output: '3' },
                { input: '"bbbbb"', output: '1' },
                { input: '"pwwkew"', output: '3' },
                { input: '""', output: '0' },
                { input: '"abcdef"', output: '6' }
            ],
            createdAt: new Date('2024-01-10')
        },
        {
            id: 'q-004',
            eventId: 'event-002',
            title: 'Binary Tree Level Order Traversal',
            description: `Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).

Example:
Input: root = [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]

Constraints:
- The number of nodes in the tree is in the range [0, 2000]
- -1000 <= Node.val <= 1000`,
            difficulty: 'Hard',
            timeLimit: '5s',
            memoryLimit: '512MB',
            points: 300,
            category: 'Trees',
            testCases: [
                { input: '[3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
                { input: '[1]', output: '[[1]]' },
                { input: '[]', output: '[]' }
            ],
            createdAt: new Date('2024-01-15')
        }
    ],

    // Sample Users
    users: [
        {
            id: 'user-001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            team: 'CodeMasters',
            problemsSolved: 15,
            totalScore: 1450,
            rank: '1',
            createdAt: new Date('2024-01-01'),
            achievements: ['First Place', 'Speed Demon', 'Problem Solver']
        },
        {
            id: 'user-002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            team: 'Algorithm Warriors',
            problemsSolved: 14,
            totalScore: 1380,
            rank: '2',
            createdAt: new Date('2024-01-02'),
            achievements: ['Second Place', 'Efficiency Expert']
        },
        {
            id: 'user-003',
            name: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            team: 'Debug Squad',
            problemsSolved: 13,
            totalScore: 1320,
            rank: '3',
            createdAt: new Date('2024-01-03'),
            achievements: ['Third Place', 'Bug Hunter']
        }
    ],

    // Sample Submissions
    submissions: [
        {
            id: 'sub-001',
            userId: 'user-001',
            eventId: 'event-001',
            questionId: 'q-001',
            code: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
            language: 'javascript',
            score: 100,
            passedTests: 4,
            totalTests: 4,
            isCorrect: true,
            executionTime: 2.5,
            memoryUsed: 45.2,
            submittedAt: new Date('2024-01-15T10:30:00Z'),
            feedback: 'Excellent solution! Optimal time complexity O(n) and space complexity O(n).'
        },
        {
            id: 'sub-002',
            userId: 'user-002',
            eventId: 'event-001',
            questionId: 'q-001',
            code: `function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}`,
            language: 'javascript',
            score: 80,
            passedTests: 4,
            totalTests: 4,
            isCorrect: true,
            executionTime: 15.2,
            memoryUsed: 38.1,
            submittedAt: new Date('2024-01-15T11:15:00Z'),
            feedback: 'Correct solution but could be optimized. Consider using a hash map for better time complexity.'
        }
    ],

    // Sample Leaderboard
    leaderboard: [
        {
            id: 'lb-001',
            team: 'CodeMasters',
            problemsSolved: 15,
            totalScore: 1450,
            bestTime: '1:23:45',
            lastUpdated: new Date('2024-01-15T12:00:00Z'),
            members: ['John Doe', 'Alice Brown'],
            rank: 1
        },
        {
            id: 'lb-002',
            team: 'Algorithm Warriors',
            problemsSolved: 14,
            totalScore: 1380,
            bestTime: '1:45:12',
            lastUpdated: new Date('2024-01-15T12:00:00Z'),
            members: ['Jane Smith', 'Bob Wilson'],
            rank: 2
        },
        {
            id: 'lb-003',
            team: 'Debug Squad',
            problemsSolved: 13,
            totalScore: 1320,
            bestTime: '1:52:30',
            lastUpdated: new Date('2024-01-15T12:00:00Z'),
            members: ['Mike Johnson', 'Carol Davis'],
            rank: 3
        },
        {
            id: 'lb-004',
            team: 'Syntax Heroes',
            problemsSolved: 12,
            totalScore: 1250,
            bestTime: '2:01:15',
            lastUpdated: new Date('2024-01-15T12:00:00Z'),
            members: ['David Lee', 'Eva Garcia'],
            rank: 4
        },
        {
            id: 'lb-005',
            team: 'Logic Legends',
            problemsSolved: 11,
            totalScore: 1180,
            bestTime: '2:15:42',
            lastUpdated: new Date('2024-01-15T12:00:00Z'),
            members: ['Frank Miller', 'Grace Taylor'],
            rank: 5
        }
    ]
};

// Function to populate Firestore with demo data
async function populateDemoData() {
    try {
        console.log('Starting to populate demo data...');
        
        // Add events
        for (const event of demoData.events) {
            await db.collection('events').doc(event.id).set(event);
            console.log(`Added event: ${event.title}`);
        }
        
        // Add questions
        for (const question of demoData.questions) {
            await db.collection('questions').doc(question.id).set(question);
            console.log(`Added question: ${question.title}`);
        }
        
        // Add users
        for (const user of demoData.users) {
            await db.collection('users').doc(user.id).set(user);
            console.log(`Added user: ${user.name}`);
        }
        
        // Add submissions
        for (const submission of demoData.submissions) {
            await db.collection('submissions').doc(submission.id).set(submission);
            console.log(`Added submission: ${submission.id}`);
        }
        
        // Add leaderboard
        for (const entry of demoData.leaderboard) {
            await db.collection('leaderboard').doc(entry.id).set(entry);
            console.log(`Added leaderboard entry: ${entry.team}`);
        }
        
        console.log('Demo data populated successfully!');
        alert('Demo data has been populated to your Firestore database!');
        
    } catch (error) {
        console.error('Error populating demo data:', error);
        alert('Error populating demo data. Check console for details.');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { demoData, populateDemoData };
} else {
    // Make available globally for browser use
    window.demoData = demoData;
    window.populateDemoData = populateDemoData;
}

console.log('Demo data loaded. Use populateDemoData() to populate your Firestore database.');

