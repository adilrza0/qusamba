const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
            scope: ['profile', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Extract user data from Google profile
                const email = profile.emails[0].value;
                const firstName = profile.name.givenName;
                const lastName = profile.name.familyName;
                const picture = profile.photos[0]?.value;

                // Check if user already exists
                let user = await User.findOne({ email });

                if (user) {
                    // User exists - check if they're using Google auth or need to link
                    if (user.authProvider === 'local') {
                        // Link Google account to existing local account
                        user.providerId = profile.id;
                        user.authProvider = 'google';
                        user.providerData = {
                            picture,
                            locale: profile._json.locale,
                            verified_email: profile._json.email_verified
                        };
                        user.emailVerified = true;
                        user.avatar = user.avatar || picture;
                        await user.save();
                    } else if (user.authProvider === 'google' && user.providerId !== profile.id) {
                        // Different Google account with same email
                        return done(null, false, {
                            message: 'An account with this email already exists with a different Google account.'
                        });
                    }
                    // Update last login
                    user.lastLogin = new Date();
                    await user.save();
                } else {
                    // Create new user with Google auth
                    user = await User.create({
                        firstName,
                        lastName,
                        email,
                        authProvider: 'google',
                        providerId: profile.id,
                        providerData: {
                            picture,
                            locale: profile._json.locale,
                            verified_email: profile._json.email_verified
                        },
                        emailVerified: true,
                        avatar: picture,
                        lastLogin: new Date()
                    });
                }

                return done(null, user);
            } catch (error) {
                console.error('Google OAuth error:', error);
                return done(error, null);
            }
        }
    )
);

module.exports = passport;
