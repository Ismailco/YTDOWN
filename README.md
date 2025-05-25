Y   Y  TTTTT  DDDD   OOO   W   W  N   N
Y   Y    T    D   D O   O  W   W  NN  N
 YYY     T    D   D O   O  W W W  N N N
  Y      T    D   D O   O  WW WW  N  NN
  Y      T    DDDD   OOO   W   W  N   N

# YouTube Downloader CLI Tool

A command-line tool for downloading YouTube videos and playlists with high quality options.

## Features

- Download single YouTube videos in best available quality
- Download entire YouTube playlists
- Progress bar with real-time download status
- Colorful terminal output for better user experience
- Automatic organization of downloaded content
- Supports mp4 format

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- [youtube-dl](https://github.com/ytdl-org/youtube-dl) binary (installed automatically as a dependency)

### Install Globally

```bash
# Clone the repository
git clone https://github.com/ismailco/YTDOWN.git
cd YTDOWN

# Install dependencies
npm install

# Install the CLI tool globally
npm install -g .
```

## Usage

After installing, you can use the `ytdown` command:

```bash
# Download a single video
ytdown -v https://www.youtube.com/watch?v=dQw4w9WgXcQ

# Download a playlist
ytdown -p https://www.youtube.com/playlist?list=PLxxx
```

## Output

Videos are saved to `~/Movies/Youtube_Downloader/` with the following structure:

- Single videos: `~/Movies/Youtube_Downloader/Single_Videos/`
- Playlists: `~/Movies/Youtube_Downloader/[Playlist_Name]/`

## Dependencies

- [youtube-dl-exec](https://www.npmjs.com/package/youtube-dl-exec) - Core download functionality
- [ytpl](https://www.npmjs.com/package/ytpl) - YouTube playlist parsing
- [fs-extra](https://www.npmjs.com/package/fs-extra) - Enhanced file system operations
- [chalk](https://www.npmjs.com/package/chalk) - Terminal styling
- [cli-progress](https://www.npmjs.com/package/cli-progress) - Progress bar

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

- If you encounter permission issues, try running with sudo: `sudo ytdown -v [URL]`
- Make sure the destination directory (`~/Movies/Youtube_Downloader/`) is accessible
- For playlist errors, verify the playlist is public or unlisted

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
