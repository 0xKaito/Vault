const hre = require("hardhat");

async function main() {

  let wethAddress = process.env.WETH;
  let admin = process.env.ADMIN;
  const vault = await hre.ethers.deployContract("Vault", [wethAddress, admin]);

  await vault.waitForDeployment();

  console.log(
    `Vault deployed at ${vault.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
