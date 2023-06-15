import { IconProps, createGlyphComponent, createIconComponent } from "@leafygreen-ui/icon";
import { LeafSVG } from "./MongoDBLogo";

const customGlyphs = {
  GeneralContentUser: createGlyphComponent("GeneralContentUser", (props) => (
    <svg
      width="40"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3.40625C9.67005 3.40625 7.78125 5.29505 7.78125 7.625C7.78125 9.95495 9.67005 11.8438 12 11.8438C14.33 11.8438 16.2188 9.95495 16.2188 7.625C16.2188 5.29505 14.33 3.40625 12 3.40625ZM13.3643 11.9473C15.2001 11.3684 16.5312 9.65214 16.5312 7.625C16.5312 5.12246 14.5025 3.09375 12 3.09375C9.49746 3.09375 7.46875 5.12246 7.46875 7.625C7.46875 9.65332 8.80145 11.3704 10.639 11.9483C6.38023 12.6084 3.09375 16.3137 3.09375 20.75V20.9062H20.9062V20.75C20.9062 16.2576 17.6209 12.5995 13.3643 11.9473ZM12 12.1562C7.32598 12.1562 3.49177 15.9389 3.40766 20.5938H20.5924C20.5093 15.8795 16.6754 12.1562 12 12.1562Z"
        fill="#5D6C74"
        stroke="#5D6C74"
        strokeWidth="0.5"
        strokeMiterlimit="10"
      />
    </svg>
  )),
  MongoDBLogo: createGlyphComponent("MongoDBLogo", (props) => <LeafSVG />),
};

const CustomIcon = createIconComponent(customGlyphs);

export default CustomIcon;

type CustomIconProps = { className: string } & Omit<
  IconProps,
  "glyph" | "color"
>;

export const GeneralContentUserIcon = (props: CustomIconProps) => (
  <CustomIcon glyph="GeneralContentUser" {...props} />
);

export const MongoDBLogoIcon = (props: CustomIconProps) => (
  <CustomIcon glyph="MongoDBLogo" {...props} />
);
