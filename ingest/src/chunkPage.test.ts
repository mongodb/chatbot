import { Page } from "chat-core";
import { chunkPage } from "./chunkPage";

describe("chunkPage", () => {
  it("chunks pages", async () => {
    const page: Page = {
      url: "test",
      body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam tempus mattis turpis sed ornare. Etiam fermentum malesuada mauris at feugiat. Proin vel augue vel velit pellentesque eleifend. Integer elit nisl, mattis non felis mollis, efficitur ornare nunc. Etiam eu semper magna. Proin molestie suscipit quam egestas ultrices. Donec eget eleifend libero. Morbi euismod, turpis sit amet convallis egestas, enim metus ornare nisi, vel egestas est purus vel arcu. Duis ut augue nec purus ultrices ultrices. Sed quis mauris felis.

Morbi lacinia pharetra vestibulum. Aliquam fringilla, arcu in porta mollis, ligula felis vulputate nibh, sed dignissim libero velit ac leo. In bibendum a eros id imperdiet. Pellentesque ac nulla id nisl maximus vulputate. Vivamus in luctus ante. Curabitur blandit lobortis nunc, id consequat diam dignissim semper. Proin quis sem purus. Duis nibh risus, tempor eget elementum id, mattis eget odio. Donec eu nisl quis leo posuere iaculis eu eu libero. Aenean non elit tincidunt, tincidunt nisl at, commodo lectus.

In orci massa, vulputate eu eros non, venenatis commodo nibh. Donec nec faucibus orci, euismod vehicula arcu. Phasellus dictum, turpis eget mattis bibendum, odio dui blandit augue, ut pretium est leo ac metus. Aenean quis velit mi. Nam dapibus porttitor tincidunt. Nulla luctus, ex ac porttitor dapibus, lorem nibh tempus est, sed tempor massa nisi eu nisi. Fusce sagittis ac risus sit amet hendrerit. Sed congue sapien et libero tempus ultricies. Nulla vel neque molestie, pellentesque velit vel, sagittis ex. Duis eleifend sapien sed diam ultrices, eu rutrum elit aliquam. Etiam in aliquam ipsum. Mauris tortor arcu, feugiat quis tincidunt sed, feugiat congue tellus. Vivamus laoreet, mauris ac ornare viverra, purus ante tristique elit, nec pretium tortor dolor a velit. Nullam ornare maximus sem, vitae euismod risus viverra eu. Maecenas eros urna, ornare id tincidunt sed, vehicula at dui.

Praesent a neque diam. Sed ultricies nunc quam, sed maximus risus dignissim sit amet. Phasellus scelerisque massa hendrerit urna convallis finibus. Fusce ornare odio eros, id ultrices nisl sodales quis. Aenean sed ullamcorper enim, sit amet varius lectus. Duis ut vestibulum eros. Maecenas bibendum felis at laoreet eleifend.

Vestibulum tempus aliquet convallis. Aenean ac dolor sed tortor malesuada bibendum in vel diam. Pellentesque varius dapibus molestie. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris blandit metus sit amet libero pretium, sit amet cursus sem tempor. Proin euismod ut mi vitae luctus. Etiam pulvinar lacus nulla, vel placerat lacus pharetra auctor.`,
      format: "md",
      sourceName: "test-source",
      tags: ["a", "b"],
    };
    const chunks = await chunkPage(page, { chunkSize: 2000, chunkOverlap: 0 });
    expect(chunks).toHaveLength(2);
    expect(chunks).toStrictEqual([
      {
        chunkIndex: 0,
        sourceName: "test-source",
        tags: ["a", "b"],
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam tempus mattis turpis sed ornare. Etiam fermentum malesuada mauris at feugiat. Proin vel augue vel velit pellentesque eleifend. Integer elit nisl, mattis non felis mollis, efficitur ornare nunc. Etiam eu semper magna. Proin molestie suscipit quam egestas ultrices. Donec eget eleifend libero. Morbi euismod, turpis sit amet convallis egestas, enim metus ornare nisi, vel egestas est purus vel arcu. Duis ut augue nec purus ultrices ultrices. Sed quis mauris felis.\n\nMorbi lacinia pharetra vestibulum. Aliquam fringilla, arcu in porta mollis, ligula felis vulputate nibh, sed dignissim libero velit ac leo. In bibendum a eros id imperdiet. Pellentesque ac nulla id nisl maximus vulputate. Vivamus in luctus ante. Curabitur blandit lobortis nunc, id consequat diam dignissim semper. Proin quis sem purus. Duis nibh risus, tempor eget elementum id, mattis eget odio. Donec eu nisl quis leo posuere iaculis eu eu libero. Aenean non elit tincidunt, tincidunt nisl at, commodo lectus.\n\nIn orci massa, vulputate eu eros non, venenatis commodo nibh. Donec nec faucibus orci, euismod vehicula arcu. Phasellus dictum, turpis eget mattis bibendum, odio dui blandit augue, ut pretium est leo ac metus. Aenean quis velit mi. Nam dapibus porttitor tincidunt. Nulla luctus, ex ac porttitor dapibus, lorem nibh tempus est, sed tempor massa nisi eu nisi. Fusce sagittis ac risus sit amet hendrerit. Sed congue sapien et libero tempus ultricies. Nulla vel neque molestie, pellentesque velit vel, sagittis ex. Duis eleifend sapien sed diam ultrices, eu rutrum elit aliquam. Etiam in aliquam ipsum. Mauris tortor arcu, feugiat quis tincidunt sed, feugiat congue tellus. Vivamus laoreet, mauris ac ornare viverra, purus ante tristique elit, nec pretium tortor dolor a velit. Nullam ornare maximus sem, vitae euismod risus viverra eu. Maecenas eros urna, ornare id tincidunt sed, vehicula at dui.",
        tokenCount: 701,
        url: "test",
      },
      {
        chunkIndex: 1,
        sourceName: "test-source",
        tags: ["a", "b"],
        text: "Praesent a neque diam. Sed ultricies nunc quam, sed maximus risus dignissim sit amet. Phasellus scelerisque massa hendrerit urna convallis finibus. Fusce ornare odio eros, id ultrices nisl sodales quis. Aenean sed ullamcorper enim, sit amet varius lectus. Duis ut vestibulum eros. Maecenas bibendum felis at laoreet eleifend.\n\nVestibulum tempus aliquet convallis. Aenean ac dolor sed tortor malesuada bibendum in vel diam. Pellentesque varius dapibus molestie. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris blandit metus sit amet libero pretium, sit amet cursus sem tempor. Proin euismod ut mi vitae luctus. Etiam pulvinar lacus nulla, vel placerat lacus pharetra auctor.",
        tokenCount: 252,
        url: "test",
      },
    ]);
  });
});
