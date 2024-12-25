import passport from "passport";
import GitHubStrategy from "passport-github2";
import userService from "../services/user.service.js";
import dotenv from 'dotenv'
dotenv.config()
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID, // Kiểm tra xem giá trị này có tồn tại trong .env không
      clientSecret: process.env.GITHUB_CLIENT_SECRET, // Kiểm tra xem giá trị này có tồn tại trong .env không
      callbackURL: process.env.GITHUB_CALLBACK_URL, // Kiểm tra lại URL callback
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let User = await userService.findByGitHubID(profile.id);
        if (!User) {
          User = {
            username: profile.username,
            githubID: profile.id,
            img: profile.photos[0]?.value || "",
            permission: "guest",
            name: profile.username
          };
          await userService.add(User);
        }
        return done(null, User);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Lưu thông tin user vào session
passport.serializeUser((user, done) => {
  // Ensure user.id is available
  if (user && user.id) {
    done(null, user.id);
  } else {
    done(new Error("User ID not found"), null);
  }
});


// Lấy thông tin user từ session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.findByID(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
