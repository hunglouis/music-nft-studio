async function main() {

  const MusicNFT =
    await ethers.getContractFactory(
      "MusicNFT"
    );

  const musicNFT =
    await MusicNFT.deploy();

  await musicNFT.waitForDeployment();

  console.log(
    "MusicNFT:",
    await musicNFT.getAddress()
  );

  const Marketplace =
    await ethers.getContractFactory(
      "NFTMarketplace"
    );

  const marketplace =
    await Marketplace.deploy();

  await marketplace.waitForDeployment();

  console.log(
    "Marketplace:",
    await marketplace.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});