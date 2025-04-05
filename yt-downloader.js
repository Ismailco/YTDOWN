#!/usr/bin/env node

const youtubedl = require('youtube-dl-exec');
const ytpl = require('ytpl');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const cliProgress = require('cli-progress');

// Create a progress bar
const progressBar = new cliProgress.SingleBar({
  format: `${chalk.cyan('{bar}')} | ${chalk.yellow('{percentage}%')} | {state}`,
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
  clearOnComplete: true
});

async function downloadVideo(videoUrl, baseOutputPath) {
  try {
    console.log(chalk.blue(`\n📥 Downloading video: ${chalk.bold(videoUrl)}`));
    const outputPath = path.join(baseOutputPath, 'Single_Videos');

    // Ensure the output directory exists
    try {
      await fs.ensureDir(outputPath);
      console.log(chalk.gray(`📁 Created directory: ${outputPath}`));
    } catch (dirError) {
      console.error(chalk.red(`❌ Error creating directory: ${dirError.message}`));
      throw dirError;
    }

    const options = {
      output: path.join(outputPath, '%(title)s.%(ext)s'),
      format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      progress: true
    };

    // Initialize progress bar
    progressBar.start(100, 0, { state: 'Starting download...' });

    // Track last percentage to avoid flickering
    let lastPercentage = 0;

    const download = youtubedl.exec(videoUrl, options, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    if (download.stdout) {
      // Parse progress information from youtube-dl output
      download.stdout.on('data', (data) => {
        const output = data.toString();

        // Extract progress percentage if available
        const progressMatch = output.match(/(\d+(?:\.\d+)?)%/);
        if (progressMatch) {
          const percentage = parseFloat(progressMatch[1]);
          if (percentage > lastPercentage) {
            lastPercentage = percentage;
            progressBar.update(percentage, { state: 'Downloading...' });
          }
        }
      });
    }

    if (download.stderr) {
      download.stderr.on('data', (data) => {
        const error = data.toString().trim();
        if (error && !error.includes('[download]')) {
          console.log(chalk.yellow(`⚠️ ${error}`));
        }
      });
    }

    await download;
    progressBar.update(100, { state: 'Complete!' });
    progressBar.stop();

    console.log(chalk.green(`\n✅ Video downloaded successfully.`));
    console.log(chalk.yellow(`📁 Video saved to: ${chalk.italic(outputPath)}`));
  } catch (error) {
    progressBar.stop();
    console.error(chalk.red(`❌ Error downloading video: ${error.message}`));
  }
}

async function downloadPlaylist(playlistUrl, baseOutputPath) {
  try {
    console.log(chalk.blue(`\n📋 Fetching playlist information...`));
    const playlist = await ytpl(playlistUrl);
    console.log(chalk.blue(`\n📥 Downloading playlist: ${chalk.bold(playlist.title)}`));
    console.log(chalk.yellow(`Total videos: ${chalk.bold(playlist.items.length)}`));

    const sanitizedFolderName = playlist.title.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
    const outputPath = path.join(baseOutputPath, sanitizedFolderName);

    // Ensure the output directory exists
    try {
      await fs.ensureDir(outputPath);
      console.log(chalk.gray(`📁 Created directory: ${outputPath}`));
    } catch (dirError) {
      console.error(chalk.red(`❌ Error creating directory: ${dirError.message}`));
      throw dirError;
    }

    for (let i = 0; i < playlist.items.length; i++) {
      const item = playlist.items[i];
      try {
        console.log(chalk.cyan(`\n🎬 [${i+1}/${playlist.items.length}] Processing: ${chalk.bold(item.title)}`));
        const videoUrl = `https://www.youtube.com/watch?v=${item.id}`;
        const sanitizedTitle = item.title.replace(/[^\w\s-]/gi, '');
        const filename = path.join(outputPath, `${sanitizedTitle}.%(ext)s`);
        const options = {
          output: filename,
          format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
          progress: true
        };

        // Initialize progress bar
        progressBar.start(100, 0, { state: `Downloading: ${item.title.substring(0, 30)}${item.title.length > 30 ? '...' : ''}` });

        // Track last percentage to avoid flickering
        let lastPercentage = 0;

        // Run youtube-dl with progress hook
        const download = youtubedl.exec(videoUrl, options, {
          stdio: ['ignore', 'pipe', 'pipe']
        });

        if (download.stdout) {
          download.stdout.on('data', (data) => {
            const output = data.toString();
            const progressMatch = output.match(/(\d+(?:\.\d+)?)%/);
            if (progressMatch) {
              const percentage = parseFloat(progressMatch[1]);
              if (percentage > lastPercentage) {
                lastPercentage = percentage;
                progressBar.update(percentage, { state: `Downloading: ${item.title.substring(0, 30)}${item.title.length > 30 ? '...' : ''}` });
              }
            }
          });
        }

        if (download.stderr) {
          download.stderr.on('data', (data) => {
            const error = data.toString().trim();
            if (error && !error.includes('[download]')) {
              console.log(chalk.yellow(`⚠️ ${error}`));
            }
          });
        }

        await download;
        progressBar.update(100, { state: 'Complete!' });
        progressBar.stop();

        console.log(chalk.green(`✅ Downloaded: ${item.title}`));
      } catch (error) {
        progressBar.stop();
        console.error(chalk.red(`❌ Error processing ${item.title}: ${error.message}`));
      }
    }
    console.log(chalk.green(`\n✅ Playlist download completed!`));
    console.log(chalk.yellow(`📁 Videos saved to: ${chalk.italic(outputPath)}`));
  } catch (error) {
    if (progressBar) progressBar.stop();
    console.error(chalk.red(`❌ Error downloading playlist: ${error.message}`));
  }
}

// Define the base output path
const baseOutputPathRaw = '~/Movies/Youtube_Downloader';
// Normalize the output path (resolve ~ to home directory)
const baseOutputPath = path.join(process.env.HOME, 'Movies/Youtube_Downloader');

// Make sure the base directory exists
try {
  fs.ensureDirSync(baseOutputPath);
  console.log(chalk.gray(`📁 Base directory ready: ${baseOutputPath}`));
} catch (error) {
  console.error(chalk.red(`❌ Error creating base directory: ${error.message}`));
  console.error(chalk.yellow(`💡 Tip: Make sure the path ${baseOutputPath} is accessible`));
  process.exit(1);
}

// Display a welcome banner
console.log(chalk.cyan('\n╔════════════════════════════════════════╗'));
console.log(chalk.cyan('║      YouTube Downloader CLI Tool       ║'));
console.log(chalk.cyan('╚════════════════════════════════════════╝\n'));

const args = process.argv.slice(2);
if (args.length === 2) {
  const [flag, url] = args;
  if (flag === '-v') {
    downloadVideo(url, baseOutputPath);
  } else if (flag === '-p') {
    downloadPlaylist(url, baseOutputPath);
  } else {
    console.log(chalk.red("❌ Invalid flag. Use -v for video or -p for playlist."));
  }
} else {
  console.log(chalk.yellow("Usage: ytdown [-v VIDEO_URL | -p PLAYLIST_URL]"));
  console.log(chalk.gray("Example: ytdown -v https://www.youtube.com/watch?v=dQw4w9WgXcQ"));
  console.log(chalk.gray("Example: ytdown -p https://www.youtube.com/playlist?list=PLxxx"));
}
