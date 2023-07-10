import { areEquivalentIpAddresses, isValidIp } from "./utils";

describe("Conversation routes utils", () => {
  describe("isValidIp()", () => {
    test("should return true for valid IPv4 addresses", () => {
      const ipv4 = "92.0.2.146";
      expect(isValidIp(ipv4)).toBe(true);
    });
    test("should return true for valid IPv6 addresses", () => {
      const ipv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
      expect(isValidIp(ipv6)).toBe(true);
    });
    test("should return false for invalid IP addresses", () => {
      const invalidIp = "notAnIp";
      expect(isValidIp(invalidIp)).toBe(false);
    });
  });
  describe("areEquivalentIpAddresses()", () => {
    test("should return true for equivalent IPv4 addresses", () => {
      const ipv4 = "92.0.2.146";
      expect(areEquivalentIpAddresses(ipv4, ipv4)).toBe(true);
    });
    test("should return true for equivalent IPv6 addresses", () => {
      const ipv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
      expect(areEquivalentIpAddresses(ipv6, ipv6)).toBe(true);
    });
    test("should return true for equivalent IPv4 and IPv6 addresses", () => {
      const ipv4 = "127.0.0.1";
      const ipv6 = "::ffff:127.0.0.1";
      expect(areEquivalentIpAddresses(ipv4, ipv6)).toBe(true);
      expect(areEquivalentIpAddresses(ipv6, ipv4)).toBe(true);
    });
  });
});
