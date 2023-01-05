#!/bin/sh

# zip lib
pip install --target ./python_lib -r requirements.txt
cd python_lib
zip -r ../dist.zip .

# zip credentials and source code
cd ..
zip -g dist.zip -r credentials
zip -g dist.zip *.py
