import article from "./article";
import benefit from "./benefit";
import communityPage from "./communityPage";
import practitioner from "./practitioner";
import salePage from "./salePage";
import siteSettings from "./siteSettings";
import { field, hospital, region } from "./taxonomies";
import whatsappGroup from "./whatsappGroup";

export const schemaTypes = [
	practitioner,
	article,
	benefit,
	communityPage,
	whatsappGroup,
	salePage,
	siteSettings,
	hospital,
	field,
	region,
];
