# Source - https://stackoverflow.com/a/11198713
# Posted by bsravanin, modified by community. See post 'Timeline' for change history
# Retrieved 2026-09-08, License - CC BY-SA 3.0

#! /bin/bash
end=$((SECONDS+3))

while [ $SECONDS -lt $end ]; do
    echo "This has been running for $((SECONDS)) seconds."
    sleep 1
    :
done

# exit 1
