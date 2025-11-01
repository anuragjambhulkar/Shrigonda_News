const { spawn } = require('child_process');
const path = require('path');

const testFile = path.join(__dirname, 'tests', 'test_mongodb.py');

const pythonProcess = spawn('python', [testFile]);

pythonProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

pythonProcess.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});