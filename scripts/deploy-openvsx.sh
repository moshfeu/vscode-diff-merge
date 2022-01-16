export $(cat .env | xargs)
echo "Publishing Open VSX"
npx ovsx publish -p ${OPEN_VSX}
