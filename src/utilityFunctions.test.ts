import { expect, test, describe } from "bun:test";
import { createUserIdentifer, isUuid } from "./utilityFunctions";

describe("Test utility functions", () => {
  test("Check if createUserIdentifer() correctly prefixes a UUID.", () => {
    const prefix = "Prinzessin_der_Verurteilung_"
    expect(createUserIdentifer(prefix)).toBeString();
    expect(createUserIdentifer(prefix)).toInclude(prefix);
    expect(createUserIdentifer(prefix)).toHaveLength(prefix.length + 36)
  })

  test("Check if isUuid() really knows what a UUID is.", () => {
    const prefix = "Prinzessin_der_Verurteilung_"
    expect(isUuid("Oz")).toBeFalse();
    expect(isUuid("Fischl", prefix)).toBeFalse();
    expect(isUuid("19f42829-b45c-47b7-8602-9b10422ba164", prefix)).toBeTrue();
    expect(isUuid("069a79f4-44e9-4726-a5be-fca90e38aaf5", prefix)).toBeTrue();
  })
})