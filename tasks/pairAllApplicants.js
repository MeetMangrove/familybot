import {pairAllApplicants} from '../main/pairing'

// if this script is executed via the CLI, generate the pairing
if (require.main === module) {
  pairAllApplicants().then(() => console.log('Done.'))
}
