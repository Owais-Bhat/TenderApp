# Tender Management System

A mobile application for managing tenders, bids, and contracts. Built with React Native and Expo.

## Features

- User and Admin roles with different permissions
- Create, view, and manage tenders
- Place bids on active tenders
- Real-time notifications for tender updates
- User profile management
- Admin dashboard with analytics
- Secure authentication

## Demo Accounts

For testing purposes, the app comes with pre-configured demo accounts:

### Admin Account
- **Email**: admin@demo.com
- **Password**: admin123

### User Account
- **Email**: user@demo.com
- **Password**: user123

## Demo Data

The app is pre-loaded with 20 sample tenders spanning various categories and statuses:
- Active tenders that are open for bidding
- Tenders that are ending soon
- Completed tenders for historical reference

Sample bids have also been generated for some tenders to demonstrate the bidding functionality.

## User Guide

### For Regular Users

1. **Login/Register**: Use the demo user account or create your own account
2. **Browse Tenders**: View all available tenders on the main screen
3. **View Tender Details**: Click on any tender to see detailed information
4. **Place a Bid**: Submit your proposal and bid amount for active tenders
5. **Track Your Bids**: View the status of your submitted bids
6. **Update Profile**: Manage your profile information

### For Admins

1. **Login**: Use the admin demo account or register as an admin
2. **Admin Dashboard**: Access analytics and system overview
3. **Manage Tenders**: Create, edit, or delete tenders
4. **Review Bids**: Evaluate and respond to submitted bids
5. **Award Contracts**: Select winning bids and award contracts
6. **User Management**: View and manage user accounts

## Technical Information

- Built with React Native and Expo
- Uses AsyncStorage for local data persistence
- Context API for state management
- React Native Paper for UI components

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
