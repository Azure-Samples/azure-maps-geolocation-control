import { Namespace } from "./helpers/Namespace";

/* Build the structure of the SDK */

//Merge the local controls into the 'atlas.control' namespace.
import * as baseControl from "./control";
const control = Namespace.merge("atlas.control", baseControl);
export { control };
