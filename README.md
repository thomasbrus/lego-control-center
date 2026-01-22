# LEGO Control Center

Web UI to interact with Pybricks Hubs and its connected motors and sensors.
More info here: https://github.com/orgs/pybricks/discussions/2553#discussion-9359219

<img width="2292" height="1712" alt="banner" src="https://github.com/user-attachments/assets/85f16b33-8169-462c-9761-ce21b165aa1d" />

## Development

### General Setup

```bash
# Install dependencies
yarn install
# Start development server
yarn dev
```

### Windows-Specific Setup Guide

### Windows-Specific Setup Guide

This describes how to set up a development environment for LEGO Control Center on Windows.

#### Prerequisites

**Note:** Users are responsible for installing and maintaining all prerequisite software. 
Download only from official sources. 
This project and its maintainers are not responsible for issues arising from third-party software installations.

Before you begin, you'll need to install the following software:

** 1. Node.js**
Download and install Node.js from the official website:
- Visit: https://nodejs.org/
- Download the **LTS (Long Term Support)** version
- Run the installer with default settings
- This will also install npm (Node Package Manager)
- Other required packages will be installed and / or updated.

To verify installation, open Command Prompt or PowerShell and run:
```bash
node --version
npm --version
```

** 2. Yarn Package Manager**
After installing Node.js, install Yarn globally:
```bash
npm install -g yarn
```

Verify installation:
```bash
yarn --version
```

** 3. Git**
Download and install Git for Windows:
- Visit: https://git-scm.com/download/win
- Run the installer with default settings

Verify installation:
```bash
git --version
```

#### Setting Up the Project

**Step 1: Clone the Repository**
Open Command Prompt or PowerShell and navigate to your desired project location:
```bash
cd C:\Users\YourUsername\Projects
git clone https://github.com/thomasbrus/lego-control-center.git
cd lego-control-center
```

**Step 2: Install Dependencies**
Install all project dependencies using Yarn:
```bash
yarn install
```

This process may take a few minutes as it downloads all required packages.

**Step 3: Start the Development Server**
Launch the development server:
```bash
yarn dev
```

The application will start and display a local URL (typically `http://localhost:5173`). 
Open this URL in your browser to access the application.


## Requirements:

The requirements for this app are the same as for code.pybricks.com.

See the documentation:
https://pybricks.com/learn/getting-started/what-do-you-need/#choosing-a-device-for-programming

### Note:

The Move Hub is not supported as it does not support the REPL due to memory limitations.
