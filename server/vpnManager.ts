export interface VpnStatus {
  connected: boolean;
  assignedIp: string;
  gateway: string;
  encryption: string;
  protocol: 'WireGuard' | 'OpenVPN' | 'IPSec';
}

export class VpnManager {
  private currentStatus: VpnStatus = {
    connected: true,
    assignedIp: '10.24.0.12',
    gateway: '10.24.0.1 (Corp VPC Gateway)',
    encryption: 'AES-256-GCM / ChaCha20-Poly1305',
    protocol: 'WireGuard'
  };

  public getStatus(): VpnStatus {
    return this.currentStatus;
  }

  public verifyCorporateSubnet(ip: string): boolean {
    // Validasi IP internal perusahaan (10.x.x.x atau 172.16.x.x atau 192.168.x.x)
    return ip.startsWith('10.') || ip.startsWith('172.16.') || ip.startsWith('192.168.');
  }
}
