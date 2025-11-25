# SCORM ZIP Extraction Backend Endpoint

To properly serve SCORM ZIP files from your cloud storage, you'll need a backend endpoint that can extract and serve the content. Here's how to implement it:

## Node.js/Express Example

```javascript
const express = require('express');
const yauzl = require('yauzl'); // ZIP file extraction
const path = require('path');
const fs = require('fs');
const { createReadStream } = require('fs');
const app = express();

// Temporary directory for extracted files
const TEMP_DIR = path.join(__dirname, 'temp', 'scorm');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * SCORM Manifest Parser
 */
async function parseScormManifest(zipFilePath) {
  return new Promise((resolve, reject) => {
    yauzl.open(zipFilePath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);

      zipfile.readEntry();
      zipfile.on('entry', (entry) => {
        if (/\/$/.test(entry.fileName)) {
          // Directory entry
          zipfile.readEntry();
        } else if (entry.fileName.toLowerCase().endsWith('imsmanifest.xml')) {
          // Found manifest file
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);

            let manifestData = '';
            readStream.on('data', (chunk) => {
              manifestData += chunk.toString();
            });
            readStream.on('end', () => {
              try {
                // Parse XML to find entry point
                const entryPoint = findEntryPoint(manifestData);
                resolve(entryPoint);
              } catch (parseErr) {
                resolve('index.html'); // Fallback
              }
              zipfile.readEntry();
            });
          });
        } else {
          zipfile.readEntry();
        }
      });

      zipfile.on('end', () => {
        resolve('index.html'); // Fallback if no manifest found
      });
    });
  });
}

/**
 * Find entry point from IMS manifest
 */
function findEntryPoint(manifestXml) {
  // Simple XML parsing to find resource with href attribute
  const resourceMatch = manifestXml.match(/<resource[^>]*href="([^"]*)"[^>]*>/i);
  if (resourceMatch) {
    return resourceMatch[1];
  }
  return 'index.html';
}

/**
 * Extract and serve SCORM content
 */
app.get('/api/scorm/launch', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'SCORM URL is required' });
    }

    // Generate unique cache key
    const cacheKey = Buffer.from(url).toString('base64').replace(/[/+=]/g, '_');
    const extractPath = path.join(TEMP_DIR, cacheKey);

    // Check if already extracted
    if (!fs.existsSync(extractPath)) {
      // Download and extract ZIP file
      console.log('Downloading SCORM package...');
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }

      const zipBuffer = Buffer.from(await response.arrayBuffer());

      // Extract ZIP
      await new Promise((resolve, reject) => {
        yauzl.fromBuffer(zipBuffer, (err, zipfile) => {
          if (err) return reject(err);

          zipfile.on('entry', (entry) => {
            if (/\/$/.test(entry.fileName)) {
              // Directory
              fs.mkdirSync(path.join(extractPath, entry.fileName), { recursive: true });
            } else {
              // File
              zipfile.openReadStream(entry, (err, readStream) => {
                if (err) return reject(err);

                const outputPath = path.join(extractPath, entry.fileName);
                fs.mkdirSync(path.dirname(outputPath), { recursive: true });

                readStream.pipe(fs.createWriteStream(outputPath));
              });
            }
          });

          zipfile.on('end', resolve);
        });
      });
    }

    // Find entry point
    const entryPoint = await findScormEntryFile(extractPath);
    const entryPath = path.join(extractPath, entryPoint);

    if (!fs.existsSync(entryPath)) {
      return res.status(404).json({ error: 'Entry point not found' });
    }

    // Serve the entry file
    res.sendFile(entryPath, {
      headers: {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'ALLOWALL', // Allow iframe embedding
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('SCORM launch error:', error);
    res.status(500).json({ error: 'Failed to launch SCORM content' });
  }
});

/**
 * Find entry file in extracted SCORM
 */
async function findScormEntryFile(extractPath) {
  const manifestPath = path.join(extractPath, 'imsmanifest.xml');

  if (fs.existsSync(manifestPath)) {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    return findEntryPoint(manifestContent);
  }

  // Fallback: look for common entry files
  const commonEntries = ['index.html', 'story.html', 'index_lms.html'];
  for (const entry of commonEntries) {
    const entryPath = path.join(extractPath, entry);
    if (fs.existsSync(entryPath)) {
      return entry;
    }
  }

  // Last resort: find first HTML file
  const files = fs.readdirSync(extractPath);
  const htmlFile = files.find(f => f.toLowerCase().endsWith('.html'));
  return htmlFile || 'index.html';
}

/**
 * SCORM API endpoint for progress tracking
 */
app.post('/api/scorm/api', (req, res) => {
  // Handle SCORM API calls (LMSInitialize, LMSGetValue, LMSSetValue, LMSCommit, LMSFinish)
  const { method, parameter, value } = req.body;

  // Implement SCORM API logic here
  // Store progress in database

  res.json({
    result: 'true', // or 'false' for error
    error_code: '0'
  });
});

/**
 * Cleanup old extracted files
 */
function cleanupOldFiles() {
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();

  fs.readdir(TEMP_DIR, (err, files) => {
    if (err) return;

    files.forEach(file => {
      const filePath = path.join(TEMP_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;

        if (now - stats.mtime.getTime() > maxAge) {
          fs.rm(filePath, { recursive: true }, () => {});
        }
      });
    });
  });
}

// Cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SCORM server running on port ${PORT}`);
});
```

## Required Dependencies

```bash
npm install express yauzl cors
```

## Frontend Integration

Update your ScormPlayer to use this endpoint:

```javascript
// In buildScormLaunchUrl function
if (baseUrl.includes('.zip')) {
  return `/api/scorm/launch?url=${encodeURIComponent(baseUrl)}`;
}
```

## Security Considerations

1. **Validate URLs**: Only allow SCORM URLs from trusted domains
2. **Rate Limiting**: Implement rate limiting on extraction endpoint
3. **File Size Limits**: Set maximum ZIP file size (e.g., 100MB)
4. **Cleanup**: Regular cleanup of temporary extracted files
5. **CORS**: Configure proper CORS headers for your domain
6. **Authentication**: Add authentication if needed

## Deployment Notes

1. **Storage**: Ensure enough disk space for extracted files
2. **Memory**: ZIP extraction can be memory-intensive
3. **Performance**: Consider caching extracted content
4. **Scaling**: For high traffic, use a distributed file system

## Alternative Solutions

If you prefer not to build your own:

1. **CloudConvert**: API service for file conversion
2. **AWS Lambda**: Serverless ZIP extraction
3. **Docker Container**: Isolated extraction environment
4. **Third-party SCORM Players**: Commercial solutions