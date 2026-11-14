// Loads the question banks for the scripts (D-072). The real questions live in the private
// repo CloudPrep-questions, checked out at src/content/ (see docs/DEPLOYMENT.md).
import { existsSync } from 'node:fs';

const PRIVATE_BANKS = 'src/content/banks.ts';

export const hasPrivateBanks = () => existsSync(PRIVATE_BANKS);

/** The private banks; stops with a clear message when the checkout is missing. */
export async function loadPrivateBanks(server) {
  if (!hasPrivateBanks()) {
    throw new Error(
      'src/content/ is missing. Clone the private questions repo there first:\n' +
        '  git clone https://github.com/chaudharyShub/CloudPrep-questions.git src/content',
    );
  }
  return (await server.ssrLoadModule(`/${PRIVATE_BANKS}`)).BANKS;
}

/** The private banks when checked out, else the public sample bank (for validation only). */
export async function loadBanksOrSample(server) {
  if (hasPrivateBanks()) return { banks: await loadPrivateBanks(server), sample: false };
  const { SAMPLE_BANKS } = await server.ssrLoadModule('/src/sample-content/index.ts');
  return { banks: SAMPLE_BANKS, sample: true };
}
