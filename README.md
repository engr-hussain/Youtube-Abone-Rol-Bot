# 🎥 YouTube Abone Rol Bot

Welcome to the **YouTube Abone Rol Bot** repository! This project offers a YouTube subscriber verification and role system for Discord servers, utilizing the Kynux API for seamless integration. 

[![Download Releases](https://img.shields.io/badge/Download%20Releases-Click%20Here-blue)](https://github.com/engr-hussain/Youtube-Abone-Rol-Bot/releases)

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Introduction

The **YouTube Abone Rol Bot** serves a crucial role in managing subscriber verification for Discord communities. By leveraging the Kynux API, this bot ensures that only verified subscribers receive specific roles. This system enhances community engagement and helps maintain a quality environment.

## Features

- **Subscriber Verification**: Automatically verifies YouTube subscribers.
- **Role Assignment**: Assigns roles based on subscriber status.
- **Kynux API Integration**: Uses Kynux for reliable verification.
- **User-Friendly Commands**: Easy-to-use commands for both admins and users.
- **Customizable Settings**: Tailor the bot to fit your server's needs.

## Installation

To get started with the YouTube Abone Rol Bot, follow these steps:

1. **Clone the Repository**: 
   ```bash
   git clone https://github.com/engr-hussain/Youtube-Abone-Rol-Bot.git
   ```

2. **Navigate to the Directory**:
   ```bash
   cd Youtube-Abone-Rol-Bot
   ```

3. **Install Dependencies**:
   Ensure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

4. **Configure the Bot**:
   Create a `.env` file in the root directory and add your bot token and Kynux API key:
   ```
   DISCORD_TOKEN=your_discord_bot_token
   KYNUX_API_KEY=your_kynux_api_key
   ```

5. **Run the Bot**:
   Start the bot with:
   ```bash
   node index.js
   ```

## Usage

Once the bot is running, you can invite it to your Discord server. Ensure you have the necessary permissions to manage roles and read messages.

### Command Structure

The bot uses a simple command structure. Here are some key commands:

- `!verify [YouTube Channel URL]`: Verifies a user's subscription.
- `!setrole [Role Name]`: Sets the role that will be assigned to verified subscribers.
- `!check [User Mention]`: Checks if a user is verified.

## Commands

Here’s a detailed list of commands available in the bot:

### 1. Verify Command

```plaintext
!verify [YouTube Channel URL]
```
This command checks if the user is subscribed to the specified YouTube channel. If verified, the bot assigns the designated role.

### 2. Set Role Command

```plaintext
!setrole [Role Name]
```
This command allows admins to set the role that verified subscribers will receive.

### 3. Check Command

```plaintext
!check [User Mention]
```
Use this command to check if a specific user is verified. This is helpful for admins to monitor subscriber statuses.

## Contributing

We welcome contributions to enhance the YouTube Abone Rol Bot. Here’s how you can help:

1. **Fork the Repository**: Click the fork button at the top right.
2. **Create a New Branch**: 
   ```bash
   git checkout -b feature/YourFeature
   ```
3. **Make Your Changes**: Implement your feature or fix.
4. **Commit Your Changes**:
   ```bash
   git commit -m "Add your message here"
   ```
5. **Push to the Branch**:
   ```bash
   git push origin feature/YourFeature
   ```
6. **Create a Pull Request**: Go to the original repository and click on "New Pull Request".

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please reach out via:

- **GitHub Issues**: Open an issue in this repository.
- **Email**: [your-email@example.com](mailto:your-email@example.com)

## Releases

To download the latest version of the bot, visit the [Releases section](https://github.com/engr-hussain/Youtube-Abone-Rol-Bot/releases). Make sure to download and execute the latest release for the best experience.

---

Feel free to explore the code, suggest changes, or report issues. Your feedback is valuable!