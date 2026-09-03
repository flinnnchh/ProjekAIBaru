import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import { User } from '../database/models/User';

export class GoogleDriveService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || 'http://localhost:3001/api/drive/oauth/callback';
  }

  public getOAuth2Client() {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('GOOGLE_CLIENT_ID atau GOOGLE_CLIENT_SECRET belum dikonfigurasi di file .env');
    }

    return new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
  }

  /**
   * Generate Google OAuth 2.0 URL for connecting Google Drive
   */
  public generateAuthUrl(userId: string): string {
    const oauth2Client = this.getOAuth2Client();

    const scopes = [
      'https://www.googleapis.com/auth/drive.file', // Create and manage only files created by this app
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
      state: userId, // Embed userId to link back in callback
    });
  }

  /**
   * Handle OAuth Callback and save tokens to User in MongoDB
   */
  public async handleOAuthCallback(code: string, userId: string): Promise<{ success: boolean; email?: string }> {
    const oauth2Client = this.getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user profile email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email || undefined;

    // Save tokens in User document
    await User.findByIdAndUpdate(userId, {
      googleDrive: {
        connected: true,
        connectedEmail: email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
      },
    });

    console.log(`[GoogleDriveService] ✅ Google Drive berhasil terhubung untuk User ID: ${userId} (${email})`);
    return { success: true, email };
  }

  /**
   * Get authenticated Google Drive client for a specific user
   */
  public async getUserDriveClient(userId: string): Promise<drive_v3.Drive> {
    const user = await User.findById(userId);
    if (!user || !user.googleDrive?.connected || !user.googleDrive?.refreshToken) {
      throw new Error('Google Drive belum terhubung untuk akun ini. Silakan hubungkan terlebih dahulu.');
    }

    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: user.googleDrive.accessToken,
      refresh_token: user.googleDrive.refreshToken,
      expiry_date: user.googleDrive.expiryDate,
    });

    // Automatically update refreshed tokens in database if renewed
    oauth2Client.on('tokens', async (newTokens) => {
      console.log(`[GoogleDriveService] 🔄 Memperbarui access token Google Drive untuk user: ${userId}`);
      const updateData: any = {};
      if (newTokens.access_token) updateData['googleDrive.accessToken'] = newTokens.access_token;
      if (newTokens.expiry_date) updateData['googleDrive.expiryDate'] = newTokens.expiry_date;
      if (newTokens.refresh_token) updateData['googleDrive.refreshToken'] = newTokens.refresh_token;
      await User.findByIdAndUpdate(userId, updateData);
    });

    return google.drive({ version: 'v3', auth: oauth2Client });
  }

  /**
   * Find or create "AI Meeting Transcripts" folder in user's Google Drive
   */
  private async getOrCreateFolder(drive: drive_v3.Drive, folderName: string = 'AI Meeting Transcripts'): Promise<string> {
    try {
      const res = await drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (res.data.files && res.data.files.length > 0) {
        return res.data.files[0].id!;
      }

      // Create new folder
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };

      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });

      console.log(`[GoogleDriveService] 📁 Folder '${folderName}' baru dibuat dengan ID: ${folder.data.id}`);
      return folder.data.id!;
    } catch (err) {
      console.error('[GoogleDriveService] Error finding/creating folder:', err);
      return 'root';
    }
  }

  /**
   * Upload Document (.docx or .txt) into user's Google Drive folder
   */
  public async uploadMeetingFile(
    userId: string,
    params: {
      fileName: string;
      mimeType: string;
      buffer: Buffer;
    }
  ): Promise<{ fileId: string; fileName: string; webViewLink: string }> {
    const drive = await this.getUserDriveClient(userId);
    const folderId = await this.getOrCreateFolder(drive, 'AI Meeting Transcripts');

    const stream = new Readable();
    stream.push(params.buffer);
    stream.push(null);

    const fileMetadata = {
      name: params.fileName,
      parents: folderId && folderId !== 'root' ? [folderId] : undefined,
    };

    const media = {
      mimeType: params.mimeType,
      body: stream,
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink',
    });

    console.log(`[GoogleDriveService] 🚀 File '${params.fileName}' berhasil diunggah ke Google Drive! Link: ${res.data.webViewLink}`);

    return {
      fileId: res.data.id || '',
      fileName: res.data.name || params.fileName,
      webViewLink: res.data.webViewLink || `https://drive.google.com/file/d/${res.data.id}/view`,
    };
  }

  /**
   * Disconnect Google Drive for a user
   */
  public async disconnectUserDrive(userId: string): Promise<boolean> {
    await User.findByIdAndUpdate(userId, {
      $set: {
        googleDrive: {
          connected: false,
          connectedEmail: undefined,
          accessToken: undefined,
          refreshToken: undefined,
          expiryDate: undefined,
        },
      },
    });
    return true;
  }
}

export const googleDriveService = new GoogleDriveService();
